# gpu-stats-firebase

# Pre-Install
1. Create AOG (Actions on Google) project at [actions console](https://console.actions.google.com/).
2. Select `Add action` at **Actions** tab.
3. Select `Custom intent` and push `BUILD`.
4. (Dialogflow) Push ⚙️ icon and import `gpu_stats.zip` at `Expoer and Import` Tab.
5. (AOG) Select `View in Firebase` at **Backend services**.

# Install
```
npm i -g firebase-tools
firebase login
firebase use ${Project id}
cd ./functions/
npm i
```

**Check project id**
```
firebase list
```

# Deploy
```
cd ./functions/
firebase deploy --only functions
```

# Reference
- https://firebase.google.com
- https://developers.google.com/actions/assistant/responses
