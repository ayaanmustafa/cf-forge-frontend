import client from './client';

// Save a note to a problem
export const saveNote = async (solvedId, note) => {
  try {
    const response = await client.post(`/note/${solvedId}`, {
      note
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
