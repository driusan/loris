import {createRoot} from 'react-dom/client';
import {useState, useEffect, lazy, Suspense} from 'react';
import {CheckboxElement, EmailElement, PasswordElement, TextboxElement} from 'jsx/Form';
import swal from 'sweetalert2';

type Preferences = {
	First_name: string;
	Last_name: string;
	Email: string;
	Language: number;
};

type Widget = {
	title: string;
	jsurl: string;
	componentname: string;
	component: any;
}

const importWidget = (url: string) => lazy(
	() => import(url)
);

function useWidgets() {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    useEffect( () => {
        fetch(loris.BaseURL + "/my_preferences/widgets")
	.then( (response) => response.json())
	.then( (json) => {
		for(const widget of json) {
			// widget.component = importWidget(widget.jsurl);
			const tag = document.createElement("script");
			tag.src = widget.jsurl;
			tag.async = true;
			const body = document.getElementsByTagName("body")[0];
			body.appendChild(tag);
			tag.onload = () => {
				widget.component = lorisjs.neurohub.widgets.default();
				console.log(json);
				setWidgets(json);
			}
		}
		// setWidgets(json);
	})
	.catch( (e) => console.warn(e));
    }, []);
    return widgets;
}
function Widgets() {
	const widgets = useWidgets();
	return (<div>
			<Suspense fallback="Loading...">
			{widgets.map( (widget: Widget) => {
			console.log("RENDERING", widget);
			return (<div key={widget.jsurl}>
				<h3>{widget.title}</h3>
				<div>LAZY COMPNENT: {widget.component}X</div>
		</div>
		       )
	})
	}
			</Suspense>
	</div>);
}

function tableRows(preferences: {
	    [module: string]: {
		    [action: string]: {
			    desc: string,
			    [servicetype: string]: string,
		    }
	    }
    }) {
	const rows = [];
	for (const module in preferences) {
		for (const action in preferences[module]) {
			const servicePrefs: any = {...preferences[module][action]};
			delete servicePrefs["desc"];
			
			rows.push({
				module: module,
				action: action,
				desc: preferences[module][action].desc,
				servicePrefs: servicePrefs,
			});
		}

	}
	return rows;
}

function Notifications() {
    const [notificationTypes, setNotificationTypes] = useState<{[key: number]: string}>({});
    const [notificationPreferences, setNotificationPreferences] = useState<{
	    [module: string]: {
		    [action: string]: {
			    desc: string,
			    [servicetype: string]: string,
		    }
	    }
    }>({});
    useEffect( () => {
        fetch(loris.BaseURL + "/my_preferences/notifications")
	.then( (response) => response.json())
	.then( (json) => {
		setNotificationPreferences(json.preferences);
		setNotificationTypes(json.services)

	});
    }, []);
    return (
	    <div>
		    <h3>Notifications</h3>
    <table className="table table-instrument" >
        <thead>
		<tr>
			<th>Module</th>
			<th>Operation</th>
			<th>Description</th>
			{Object.values(notificationTypes).map( (value) => <th key={value}>{value}</th> )}
		</tr>
        </thead>
	<tbody>{tableRows(notificationPreferences).map( (row) => {
		return <tr key={row.module + ":" + row.action}>
			<td>{row.module}</td>
			<td>{row.action}</td>
			<td>{row.desc}</td>
			{Object.values(notificationTypes).map( (serviceType) => <td key={serviceType}>
							      <CheckboxElement
							      	name={row.module + ":" + row.action + ":pref"}
								label=""
								value={row.servicePrefs[serviceType] === "Y"}
								onUserInput= {(name, value) => {
									const newVal = {...notificationPreferences};
									newVal[row.module][row.action][serviceType] = (value === true) ? 'Y' : 'N';
									setNotificationPreferences(newVal);
								}}
							       	/>
					</td>)}
		</tr>
	})
	}
	</tbody>
    </table>
    </div>
    );
}

/**
 * Return the main page for the My Preferences page
 *
 * @param {object} props - React props
 * @param {string} props.username - The user accessing the app
 * @returns {React.ReactElement} - The main page of the app
 */
function MyPreferences(props: {
    username: string
}) {
    const [prefs, setPrefs] = useState<Preferences>({ First_name: "", Last_name: "", Email: "", Language: 0});
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPassword2, setNewPassword2] = useState<string>("");
    useEffect( () => {
        fetch(loris.BaseURL + "/my_preferences/prefs")
	.then( (response) => response.json())
	.then( (json) => setPrefs(json));
    }, []);
    const putPrefs = () => {
        fetch(loris.BaseURL + "/my_preferences/prefs", {
		method: "PUT",
		body: JSON.stringify(prefs),
	})
	.then( (response) => response.json())
	.then( (json) => setPrefs(json));
    };
    return (
<form method="post" name="my_preferences" id="my_preferences">
    <h3>Password Rules</h3>
      <ul>
        <li>The password must be at least 8 characters long.</li>
        <li>The password cannot be your username or email address.</li>
        <li>No special characters are required but your password must be sufficiently complex to be accepted.</li>
      </ul>
        <p>Please choose a unique password.</p>
        <p>We suggest using a password manager to generate one for you.</p>
    <h3>Edit My Information</h3>
   <TextboxElement name="username" label="User name"  value={props.username} disabled={true} onUserInput={() => {} } />
   <TextboxElement name="First_name" label="First name"  value={prefs.First_name} onUserInput={(name, value: string) => {
	   setPrefs({...prefs, First_name: value});
   }} />
   <TextboxElement name="Last_name" label="Last name"  value={prefs.Last_name} onUserInput={(name, value: string) => {
	   setPrefs({...prefs, Last_name: value});
   }} />
   <EmailElement name="Email" label="Email address"  value={prefs.Email} onUserInput={(name, value: string) => {
	   setPrefs({...prefs, Email: value});
   }} />
   <PasswordElement name="password" label="New Password"  value={newPassword} onUserInput={(name, value: string) => {
	   setNewPassword(value);
   }} />
   <PasswordElement name="password_confirm" label="Confirm Password"  value={newPassword2} onUserInput={(name, value: string) => {
	   setNewPassword2(value);
   }} />
    <div className="row form-group">
        <label className="col-sm-2">
		Language preference
        </label>
        <div className="col-sm-10">
        </div>
    </div>
    <Notifications />
    <Widgets />
    <div className="row form-group">
        <div className="col-sm-2">
            <input className="btn btn-sm btn-primary col-xs-12" value="Save" type="submit" onClick={(e) => {
		    e.preventDefault();
		    if (newPassword !== newPassword2) {
			    swal.fire("Error", "Passwords do not match", "error");
			    return;
		    }
		    if (newPassword !== "") {
			    // Update password
		    }
		    // Update prefs
		    putPrefs();
		    // Update notifications
	    }}/>
        </div>
        <div className="col-sm-2">
            <input className="btn btn-sm btn-primary col-xs-12" value="Reset" type="reset" />
        </div>
    </div>
</form>
    );
}

declare const loris: any;
declare const lorisjs: any;
window.addEventListener('load', () => {
  const element = document.getElementById('lorisworkspace');
  if (!element) {
      throw new Error('Missing lorisworkspace');
  }
  const root = createRoot(element);

  root.render(
    <MyPreferences
        username={loris.user.username}
    />,
  );
});

export default MyPreferences;
