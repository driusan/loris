//import AccessProfilePanel from './AccessProfilePanel';
import CandidateListTable from './CandidateListTable';


$(function() {
    /*
  ReactDOM.render(
    <AccessProfilePanel />,
    document.getElementById("openprofile")
  );
  */
    console.log(<CandidateListTable />);
  ReactDOM.render(<CandidateListTable />, document.getElementById("datatable"));
});
