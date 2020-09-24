## Running the Application from Logica Sandbox
### Login
To run the differential diagnosis app in the test sandbox, go to [sandbox.logicahealth.org] and login with the following credentials:
```
Username: thundercats
Password: comp3000
```

Then select the sandbox titled `differential-diagnosis-uat`, on the My Sandboxes page.

### Launching the Application
Once inside the sandbox environment, select `Launch Scenarios` from the navbar on the left.

You will see the possible launch scenarios listed here (just one configured for now). Click the "play" button on the right hand side of a scenario to launch it in the EHR simulator.

### Changing Patients
You can freely change the current patient in the EHR context on the top left of the EHR window, simply click the patient's name and you will be presented with the option to select another patient.

When you load a patient who already has some diagnoses saved on the FHIR server, it may take a few seconds to populate the app with these.