export default function HelpPanel() {
  const entries = [
    {
      q: "How do I start a simulation?",
      a: "Navigate to 'New Simulation' from the sidebar. Choose Document Mode to upload a personality document (PDF or text), or Search Mode to simulate a known person by entering their name and details. Once submitted, a chat interface will appear where you can converse with the simulated personality.",
    },
    {
      q: "How do I add my own API key?",
      a: "In Search Mode, select 'Use My API Key' under API Configuration. Enter your key in the password field that appears. The key must be at least 20 characters. Your key is encrypted using AES-GCM before being stored in memory and is only decrypted at the moment of each API call.",
    },
    {
      q: "How do I switch themes?",
      a: "Open Settings from the sidebar. Under 'Colour Theme', choose from nine available themes. Under 'Display Mode', switch between Light, Dark, or System (which follows your operating system preference). Your selections are saved and persist across sessions.",
    },
    {
      q: "How do I clear a conversation?",
      a: "During an active simulation, click the 'Clear' button in the top-right corner of the chat header. This removes all messages from the current session. You can also click 'Back' to return to the mode selector and start a new simulation.",
    },
    {
      q: "What is recalibration?",
      a: "The model periodically refreshes its understanding of the character to stay accurate. This happens automatically every few messages — there is no action required from you. It ensures the simulated personality remains consistent in tone, knowledge, and behaviour throughout the conversation.",
    },
    {
      q: "Keyboard shortcuts",
      a: "Press Enter to send a message in the chat. Press Ctrl+B (or Cmd+B on Mac) to toggle the sidebar open or closed.",
    },
  ];

  return (
    <div className="help-panel">
      <div className="help-title">Help</div>
      {entries.map((entry, i) => (
        <div key={i} className="help-entry">
          <div className="help-question">{entry.q}</div>
          <div className="help-answer">{entry.a}</div>
        </div>
      ))}
    </div>
  );
}
