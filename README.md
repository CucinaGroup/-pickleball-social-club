# Clarice's Pickleball Social Club

Random partners, knockout bracket, default defeat for no-shows. Everyone with the
link sees live results; only the organiser (with the PIN) can make changes.

## Deploy on Netlify (via GitHub)

1. Create a new GitHub repository and upload everything in this folder
   (index.html, package.json, netlify.toml, netlify/functions/state.mjs).
2. In Netlify: Add new site > Import an existing project > GitHub > pick the repo.
   Leave the build settings as they are and click Deploy.
3. In Netlify: Site configuration > Environment variables > Add a variable
   - Key: ADMIN_PIN
   - Value: your organiser PIN (e.g. a 6-digit number only you know)
4. Deploys > Trigger deploy > Deploy site (so the PIN takes effect).

## On the day

- Open your Netlify link, tap "Organiser login", enter your PIN. You get the controls.
- Share the same link with players. They see the bracket and results, view only,
  updating every few seconds. No sign-in needed.
- To change the PIN, edit ADMIN_PIN in Netlify and redeploy.
