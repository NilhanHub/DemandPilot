import { getAccessToken } from './firebase';

export async function createKeepNote(title: string, content: string) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token. Please sign in again.');
  }

  const response = await fetch('https://keep.googleapis.com/v1/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      body: {
        text: {
          text: content
        }
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Keep note: ${response.status} ${errorText}`);
  }

  return response.json();
}
