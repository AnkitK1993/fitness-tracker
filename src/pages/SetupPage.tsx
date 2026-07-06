/** Shown when Firebase env vars are missing — walks through one-time project setup. */
export function SetupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card card setup-card">
        <h1>💪 Fitness Tracker</h1>
        <h2>One-time setup needed</h2>
        <p>This app stores data in your own Firebase project. To connect it:</p>
        <ol>
          <li>
            Go to <strong>console.firebase.google.com</strong> and create a project.
          </li>
          <li>
            In <strong>Build → Authentication → Sign-in method</strong>, enable <strong>Email/Password</strong>.
          </li>
          <li>
            In <strong>Build → Firestore Database</strong>, create a database (production mode).
          </li>
          <li>
            In <strong>Project settings → Your apps</strong>, add a <strong>Web app</strong> and copy its config
            values.
          </li>
          <li>
            Copy <code>.env.example</code> to <code>.env.local</code> in this project and paste the values.
          </li>
          <li>
            Publish the security rules from <code>firestore.rules</code> (Firestore → Rules tab), then restart{' '}
            <code>npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  )
}
