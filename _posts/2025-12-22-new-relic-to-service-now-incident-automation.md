# New Relic to ServiceNow Incident Automation(Lab Guide)
## Objective
Create a closed-loop incident management system where New Relic automatically creates ServiceNow incidents when CPU usage is high and resolves them when usage returns to normal.

## Architecture:
1. <b>Monitor:</b> New Relic Infrastructure Agent monitors a local machine.
2. <b>Trigger:</b> NRQL Alert Policy detects CPU > 5%.
3. <b>Transport:</b> New Relic Workflow sends a Webhook `POST` request.
4. <b>Logic:</b> ServiceNow Scripted REST API receives the request, checks for a `correlation_id`, and decides whether to `insert()` (Create) or `update()` (Close).

## Part I: Environment Setup
Before configuring the integration, you need to establish your "Sandbox" environment.

### 1. Get a ServiceNow Personal Developer Instance (PDI)
<i>ServiceNow does not run locally; you must use their cloud sandbox.</i>

1. Go to the [ServiceNow Developer Site](https://developer.servicenow.com/).

2. Sign up for a free account.

3. Click Request Instance.

4. Wait a few minutes. You will receive:

    - URL: e.g., `https://devXXXXX.service-now.com`
    - Username: e.g., `admin`
    - Password: e.g., `XXXXXX`(Save this securely)

5. Log in to your instance using the provided URL, username, and password.

### 2. Get New Relic & Install Agent
1. Sign up for a free New Relic account at [New Relic Sign Up](https://newrelic.com/signup).
2. Once logged in, go to <b> Add Data > Linux </b> (or MacOS/Windows depending on your local machine).
3. Follow the instructions to run the installation command in your terminal.
    - Example (linux): 
      ```bash
      curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=YOUR_API_KEY NEW_RELIC_ACCOUNT_ID=YOUR_ACCOUNT_ID newrelic install
      ```
4. Verify data is flowing by going to <b> Infrastructure > Hosts </b> in New Relic.

## Part II: ServiceNow Configuration(The Listener)
We will build a "Smart Endpoint" that accepts the alert data.

### 1. Create the API Container
1. In your ServiceNow PDI, use the Filter Navigator (top left) to search for "Scripted REST APIs".
2. Click <b> New </b>.
    - <b>Name:</b> `NewReliWebhook`
    - <b>API ID:</b> `newrelic_handler`
3. Click <b> Submit </b>.

### 2. Create the Resource(The Endpoint)
1. Open the `NewRelicWebhook` record you just created.
2. Scroll down to the Resources tab and click <b> New </b>.
    - <b>Name:</b> `HandleAlert`
    - <b>HTTP Method:</b> `POST`
    - <b>Relative Path:</b> `/incident`

3. <b>The Script:</b> Delete the default code in the <b> Script </b> field and paste the following "Traffic Cop" logic:

    ```javascript
    (function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
        // 1. Parse the incoming JSON from New Relic
        var requestBody = request.body.data;
        var nrIssueId = requestBody.issue_id;
        var nrState = requestBody.current_state;
        var nrTitle = requestBody.title;
        var nrCpu = requestBody.cpu_value;

        // 2. Look for an existing Incident with this New Relic Issue ID
        var gr = new GlideRecord('incident');
        gr.addQuery('correlation_id', nrIssueId);
        gr.query();

        if (gr.next()) {
            // --- SCENARIO: UPDATE EXISTING INCIDENT ---
            if (nrState === 'CLOSED') {
                gr.state = 6; // Set to 'Resolved' (Standard ID)
                gr.close_code = 'Solved (Permanently)';
                gr.close_notes = 'Cloased automatically by New Relic. Alert cleared.';
                gr.work_notes = "New Relic reports issue is closed.";
                gr.update();

                return { status: "Incident Resolved", number: gr.number };
            } else {
                // Optional: Update work notes if it's just an update
                gr.work_notes = "Received update from New Relic. Current CPU: " + nrCpu + "%";
                gr.update();
                return { status: "Incident Updated", number: gr.number };
            }
        } else {
            // --- SCENARIO: CREATE NEW INCIDENT ---
            if (nrState == 'ACTIVATED') {
                var newInc = new GlideRecord('incident');
                newInc.initialize();
                newInc.short_description = "New Relic Alert: " + nrTitle;
                newInc.description = "Automatic alert from New Relic.\nIssue ID: " + nrIssueId + "\nCPU Usage: " + nrCpu + "%";
                newInc.correlation_id = nrIssueId; // THIS IS CRITICAL
                newInc.caller_id = gs.getUserID(); // Assign to API user
                newInc.urgency = 2; // High
                newInc.insert();

                return { status: "Incident Created", number: newInc.number };
            }
        }
    })(request, response);
    ```
4. Click <b>Submit.</b>
5. <b>Important:</b> Note your full Endpoint URL. It will be: `https://devXXXXX.service-now.com/api/x_scope_id/newrelic_handler/incident`

## Part III: New Relic Configuration(The Trigger)
### 1. Configure the Destination
1. In New Relic, go to <b>Alerts & AI > Destinations</b>.
2. Select <b> Webhook </b>.
    - <b>Endpoint URL:</b> Your ServiceNow Scripted REST API URL from above.
    - <b>Authorization Type:</b> Select <b>Basic Authentication</b>. Use your PDI `admin` username and password.
3. Name it "ServiceNow PDI".
### 2. Configure the Workflow (Payload)
1. Go to <b> Alerts & AI > Workflows </b>.
2. Click <b> Add Workflow </b>.
    - <b>Filter:</b> `Policy Name = 'Low CPU Test'` ( we will create policy in the next step)
3. <b>Notify:</b> Select your "ServiceNow PDI" destination.
4. <b>Payload Template:</b> This defines exactly what data is sent to script. Paste this JSON:
    ```json
    {
        "issue_id": "{{issueId}}",
        "title": "{{annotations.title}}",
        "current_state": "{{state}}",
        "cpu_value": "{{#if accumulations.conditionName}}{{accumulations.conditionName[0]}}{{else}}N/A{{/if}}"
    }
    ```
### 3. Create the Alert Policy
1. Go to <b>Alerts & AI > Conditions (Policies) </b>.
2. Create a New Policy named `Local CPU Test`.
3. <b>Create a Condition:</b>
    - <b>Product:</b> NRQL
    - <b>Query:</b>
        ```sql
        SELECT average(cpuPercent) FROM SystemSample WHERE `hostname = 'YOUR_HOSTNAME'
        ```
    - <b>Threshold:</b> Critical if query returns value `above 5` (Low threshold for easy testing) for at least `1 minute`.
    - <b>Advanced Signal Settings:</b> "Close open incidents on signal loss" -> set to `5 minutes`.

## Part IV: Execution & Testing
### Test A: Unit Test via cURL (Command Line)
Verify your serviceNow script works without waiting for New Relic.
#### 1. Create Incident(Simulate Alert)
```bash
curl "https://<YOUR_INSTANCE>.service-now.com/api/<YOUR_SCOPE_ID>/newrelic_handler/incident" \
--request POST \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--user 'admin:<YOUR_PASSWORD>' \
--data '{
  "issue_id": "TEST12345",
  "title": "Test High CPU Alert",
  "current_state": "ACTIVATED",
  "cpu_value": "95"
}'
```
<b><i>Result</b>: Check ServiceNow incidents table. You should see a new ticket.</i>

#### 2. Resolve Incident(Simulate Recovery)
```bash
curl "https://<YOUR_INSTANCE>.service-now.com/api/<YOUR_SCOPE_ID>/newrelic_handler/incident" \
--request POST \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--user 'admin:<YOUR_PASSWORD>' \
--data '{
  "issue_id": "TEST12345",
  "title": "Test High CPU Alert",
  "current_state": "CLOSED",
  "cpu_value": "20"
}'
```
<b><i>Result</b>: The ticket created in step 1 should now be marked as "Resolved".</i>

### Test B: End-to-End Integration ("Smoke Test")
Now, use the `strees` tool to forced a real CPU spike on your local machine.
1. Install Stress Tool:
    - Linux: `sudo apt-get install stress`
    - MacOS: `brew install stress`
2. Run Stress:
    - `stress --cpu 8 --timeout 180` (Runs for 3 minutes).
3. Monitor:
    - <b>T+0 to T+1 min:</b> New Relic detects high CPU.
    - <b>T+1 min:</b> New Relic triggers Alert -> Webhook -> <b>ServiceNow creates Incident</b>.
    - <b>T+3 min:</b> Stress command ends, CPU drops.
    - <b>T+5 to T+8 min:</b> New Relic closes Alert -> Webhook -> <b>ServiceNow resolves Incident</b>.

## Appendix: Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Bad credentials | Check your PDI admin password. Update the Destination in New Relic. |
| 403 Forbidden | Scope/ACL | Ensure the user has the `admin` or `rest_service` role. |
| 404 Not Found | Bad URL | Check your API ID and Resource Path. Ensure the Resource is set to `POST`. |
| Duplicate Incidents | Logic Error | Verify the `gr.addQuery` in the script matches the `issue_id` being sent. |