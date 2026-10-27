# Store assets

## Screenshots

`screenshots/` holds the App Store screenshots for the 6.9" iPhone slot
(1320 × 2868), which App Store Connect accepts for every iPhone size it
currently lists.

They are not hand-made. They come from a real build of the app running on an
iOS simulator in GitHub Actions, signed in to a temporary demo account, and are
captured by `.github/workflows/ios-screenshots.yml`:

- `01-inicio.png` — home, with the member's next event and conversations
- `02-personas.png` — people directory and its language search
- `03-eventos.png` — upcoming meetups with dates, venues and seats taken
- `04-inbox.png` — message requests and open conversations
- `05-perfil.png` — profile, languages spoken and languages practised
- `06-chat.png` — conversation with a matched member
- `07-evento.png` — event detail with venue and RSVP
- `08-bienvenida.png` — welcome screen

### Re-capturing them

Run the workflow from the Actions tab, or:

```sh
gh workflow run ios-screenshots.yml \
  --repo ernestoho/nomadalingo-app \
  -f build_url="<EAS simulator build artifact URL>" \
  -f email="demo1@nomadalingo.invalid" \
  -f chat_id="714da45e-0699-4be0-b00a-870c14246618"
```

Then download the finished set to the Desktop with:

```sh
./scripts/fetch-screenshots.sh
```

### How the demo account works

The workflow signs in as a throwaway account by deep-linking straight to the
code screen, so it never sends email. The code is minted by the
`screenshot-login-temp` Edge Function, which only accepts
`@nomadalingo.invalid` addresses.

**Status: the demo accounts have been deleted.** The six profiles, the
conversation with its messages, the pending message request and the event RSVP
were removed after the screenshots above were captured. The three events were
kept; their `created_by` is now `null` because the demo member who created them
is gone.

Re-capturing therefore needs, in order:

1. Re-deploy `screenshot-login-temp` (it is deleted from the project once a
   capture cycle is finished, so it cannot be left minting codes).
2. Re-seed the demo profiles and conversation, or adjust `.maestro/chat.yaml`
   and `.maestro/event.yaml` to target whatever content exists.
3. Run the workflow, then download with `./scripts/fetch-screenshots.sh`.
4. Delete the function and the demo accounts again.

> Note: the function creates an account when the address does not exist yet, so
> probing it after cleanup re-creates a stray member. Delete the function when
> you are done rather than leaving it deployed.

