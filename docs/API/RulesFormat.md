This file describes the general format to be used by Loris to describe
rules as a JSON object and will likely become an important of the
API and/or mobile specific versions of Loris.

This spec is NOT YET IMPLEMENTED. Anywhere. However, it will supercede
the .rules files created by the current instrument builder.

=========================================================================

# 1.0 Rules Format Overview

A "rule" represents a dependency between values on two questions or user inputs.
Rules may be on the same page or between different pages.
This spec is meant to complement the accompagnying InstrumentFormat spec but may
be used independently.

On a high level, a rule has the following form:

```json
{
    "Meta": {
        "InstrumentVersion": string,
        "RulesFormatVersion" : "v0.0.2a-dev",
        "RequiredDefault" : boolean
    },
    "Rules": {
        "QuestionName": { QuestionRules },
        "AnotherQuestion": { QuestionRules }
        ....
    }
}
```

The Meta object mirrors the Instrument format and has the following meaning.

`InstrumentVersion`: represents the (author-specified) version of this instrument

`RulesFormatVersion`: specifies the version of this spec that the accompagning JSON document follows.
                      If combined with the instrument JSON format in the same JSON object,
                      `RulesFormatVersion` and `InstrumentFormatVersion` MAY be different.

`RequiredDefault`: Whether the default rule for fields obeying this spec is to be required, or
                   not required. If `RequiredDefault` is true, all fields will be required unless
                   one or more rules are specified for the question. If `RequiredDefault` is false,
                   all fields will not be required unless a rule is set. When `RequiredDefault`
                   is true and you need to specify that a question is NOT required, you can assign
                   an empty object to the question in the top level Rules object.


Like in the instrument JSON object, `InstrumentVersion` SHOULD change if the rules are
modified in any way.

An implementation should ignore any unexpected keys so as to support extensions of this
spec.

The `Rules` key contains an object where each key matches the identifier of the question
for which the rule applies. The value is an object of QuestionRule type (specified below).

There are two ways of thinking of the logic for a rule. Either you want to generate and error
if any rule fails, or you want to generate an error if any rule passes.

This is denoted by a "LogicType" key which can be either "Pass" or "Fail" on parts of the
specification that denote the logic for a question.

You may think of either rules as checking for a failure:

```
if (Rule1 Fails) OR (Rule2 Fails) OR (Rule3 Fails) OR ...
    throw error for question
```

which is equivalent to

```
if NOT (Rule1 Passes AND Rule2 Passes AND Rule3 Passes AND ...)
    throw error for question

```

(proof left as an exercise to the reader)

This is considered a "Fail" logic type, because the logic is checking for a failure in the rules.

You may instead be thinking of rules that check for the success of a rule.

```
IF (Rule1 Passes OR Rule2 Passes OR Rule3 Passes OR ...)
    throw error for question
```

(which is equivalent to

```
If NOT (Rule1 Fails AND Rule2 Fails AND Rule3 Fails AND ...)
    throw error for question
```

This is considered "Pass" logic type in this spec because the logic is checking for the success of
any rule.

Generally, where there is a "LogicType" key defined in this spec, there is also a "Negate"
key (boolean) to negate the logic. In this way, the spec should be logically complete and any
arbitrarily complex rule can be implemented.

## 1.1 Question Rules Object

The `Rules` array in the top level element contains a set of rules. Question has an object
which specifies the LogicType you would like to use for that rule, as well as an array
of rules to register for that object. It has the following form.

```json
{
    LogicType: "Pass|Fail"
    "Negate": boolean
    "Rules" : [ IndividualRuleObject ]
}
```

The LogicType/Negate indicate which type of logic to apply to the Rules array as specified
in section 1.0. The IndividualRuleObject definition is defined below.

Pass means if any single IndividualRuleObject passes, the question rule fails.
Fail means if any single IndividualRuleObject fails, the question rule fails.
.
## 1.2 IndividualRuleObject

An individual rule object represents an individual block of logic that may pass or fail for
a question.

It has the following form

```json
{
    Type: "hide" or "error" /* Hide means QuestionName should not be displayed if the rule
                               fails. Error means an error message should be displayed if
                               the rule fails */
    "ErrorMessage" : string optional, message to display if rule fails and "error" type
    "Rule" : {
        LogicType: "Pass" /* If any single matcher passes all of its requirements, the rule fails.
                                 ie. the matchers are ORed and an error provided if any do not pass */
                   "Fail" /* If any single matcher fails all of its requirements, the rule fails.
                                 ie. the Matchers are ANDed to ensure that they all pass */
        "Negate": boolean
        "Description" : string optional
        "Logic" : [ { "OtherQuestion" :  LogicAtom } ]
    }
}
```

You must specify the "type", which indicates if the rule being violated indicates an
error message to be displayed to the user ("error" type) or if the rule being violated
means that the question should just not be displayed to the user ("hide" type). If
The type is error, you should also specify an error message.

The "Rule" key denotes the logic for the rule. Like for a question, you may specify the
LogicType that you are using to evaluate the rule, and whether you're looking for a "Pass"
or a "Fail" to indicate the rule is being violated. You may optionally add a description
to help with maintenance of the ruleset.

The "Logic" key contains an array of LogicAtoms to be evaluated using the LogicType against
the value from the question provided by the key in the Logic attribute.

## 1.3 LogicAtom

A LogicAtom is an individual thing that will be evaluated to true or false. It is represented
by an object of the following form.

```json
{
    "Negate": boolean
    "Requirements": {
        "gt" : "value"
        "gte" : "value"
        "lt" : "value"
        "lte" : "value"
        "in" : ["value", "value2"]
        "eq" : "value"
        "$gt" : "otherfield"
        "$gte" : "otherfield"
        "$lt" : "otherfield"
        "$lte" : "otherfield"
        "$neq" : "otherfield"
        "$in" : ["otherfield1", "otherfield2"]
        "$eq" : "otherfield"

        "Rules" : [ IndividualRuleObject ]
    }
}
```

If all of the requirements in a LogicAtom are true, the LogicAtom evaluates to true.

If "negate" is true, the evaluation of the LogicAtom will be negated.

The `Requirements` key represents an object of the logic to evaluate for this LogicAtom.
At least one of the items in the requirements should be set. If multiple requirements are
set, they must all be true for the LogicAtom to evaluate to true.

The keys for the requirements have the following meaning:
    gt - greater than
    gte - greater than or equal
    lt - less than
    lte - less than or equal
    eq - equal
    in - true if value is equal to any of the values

The values of the keys are a hardcoded value. The same operators prefixed with a
dollar sign ($), mean that the value will be compared against the value of the field
specified, not a hardcoded value.

If a "Rules" Requirement is set, it should contain an entire IndividualRuleObject to evaluate.
This can effectively be used to add "brackets" to your logic.


## 2.0 Rule samples

TODO: VERIFY THAT THIS IS ALL CORRECT

The following are some samples of some rules from Loris instruments written using QuickForm's addFormRule
syntax, and how they could be rewritten using this spec.

First, comes from the a telephone screening instrument.

```php
function tsi_Rules($values) {
    $errors = array();
    $gestation = intval ($values["gestation_proband"]);
    if($gestation < 0 || $gestation > 45){
        $errors['gestation_proband'] = 'Please enter value between 0-45';

    }
    if( ($values["lighttherapy_days_proband"] == null || $values["lighttherapy_days_proband"] == '')
            && ($values["lighttherapy_days_proband_status"] == null || $values["lighttherapy_days_proband_status"] == '')
            && $values["lighttherapy_proband"] == "yes") {
        $errors['lighttherapy_days_proband_group'] = 'Required' ;
    }
    return errors;
}
```

This would be equivalent to:
```json
{
    "Meta": {
        "InstrumentVersion": "tsisample",
        "RulesFormatVersion" : "v0.0.2a-dev",
        "RequiredDefault" : false
    },
    "Rules": {
        "gestation_proband": {
            "LogicType": "Pass"
            "Description" : "
                Conversion from the QuickForm of

                $gestation = intval ($values[gestation_proband]);
                if($gestation < 0 || $gestation > 45){
                    $errors[gestation_proband] = Please enter value between 0-45;
                }
            ",
            "Rules" : [
                {
                    Type: "error"
                    "ErrorMessage" : "Please enter value between 0-45"
                    "Rule" : {
                        LogicType: "Pass"
                        Logic: [
                            {
                                "gestation_proband" : {
                                    "Requirements" : {
                                        "lt" : 0,
                                        "gt" : 45
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "light_therapy_days_proband": {
            LogicType: "Pass"
            "Description": "
                If lighttherapy_proband is yes, lighttherapy_days_proband_group is required.

                Conversion of logic from the QuickForm:

                if( ($values[lighttherapy_days_proband] == null || $values[lighttherapy_days_proband] == '')
                    && ($values[lighttherapy_days_proband_status] == null || $values[lighttherapy_days_proband_status] == '')
                    && $values[lighttherapy_proband] == yes) {
                        $errors[lighttherapy_days_proband_group] = Required ;
                }",
            "Rules" : [
                {
                    Type: "error"
                    "ErrorMessage" : "Required"
                    "Rule" : {
                        LogicType: "Fail"
                        Logic: [
                            {
                                "lighttherapy_days_proband" : {
                                    "Requirements" : {
                                        "eq" : ''
                                    }
                                  },
                                  "lighttherapy_days_proband_status" : {
                                     "Requirements" : {
                                            "eq" : ''
                                        }
                                    },
                                    "lighttherapy_proband : {
                                        "Requirements" : {
                                            "eq" : "yes"
                                        }
                                    }
                            }
                        ]
                    }
                }
            ]
        },
    }
}
```

The following are some XIN rules from the same instrument, and the QuestionRuleObjects that can be used to convert them.

```php
$this->XINRegisterRule (
    "mother_education_rule",
    array ("mother_education{@}!={@}"),
    "Please enter the mother's education"
);
```

```js
"mother_education_rule" : {
    "LogicType": "Pass"
    "Description" : "Conversion from the XINRule:
        $this->XINRegisterRule (mother_education_rule, array (mother_education{@}!={@}), Please enter the mothers education)",
    "Rules" : [
                {
                    Type: "error",
                    "ErrorMessage" : "Please enter the mothers education",
                    "Rule" : {
                        LogicType: "Pass"
                        Logic: [
                            {
                                "mother_education" : {
                                    Negate: true
                                    "Requirements" : {
                                        "eq" : ''
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        },
}
```

```php
$this->XINRegisterRule ( "med_his_q_8_brain_MRI_results", array("med_his_q_8_brain_MRI{@}=={@}yes"),"Please specify results");
```

```js
"med_his_q_8_brain_MRI_results" : {
    "LogicType" : "Fail",
    "Rules" : [
        Type: "error",
        "ErrorMessage" : "Please specify results",
        "Rule" : {
            "LogicType" : "Pass",
            "Logic" : [
                {
                    "med_his_q_8_brain_MRI" : {
                        Requirements" : {
                            "eq" : "yes"
                        }
                    }
                }
            ]
        }
    ]
}
```
