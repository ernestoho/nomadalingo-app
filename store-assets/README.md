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
`@nomadalingo.invalid` addresses. **Delete that function from Supabase once the
screenshots are final** — it exists only for this pipeline.

The demo profiles, the conversation and the RSVP are removed together at the
end of a capture cycle; nothing in the store listing depends on them.
