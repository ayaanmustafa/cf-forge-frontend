import client from './client';

// Get all tags for a user
export const fetchTags = async (handle) => {
  try {
    const response = await client.get(`/tags/${handle}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new tag
export const createTag = async (handle, name, color = '#3b82f6') => {
  try {
    const response = await client.post(`/tags/${handle}`, {
      name,
      color
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a tag
export const deleteTag = async (tagId) => {
  try {
    const response = await client.delete(`/tags/${tagId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add tag to a problem
export const addTagToProblem = async (solvedId, tagId) => {
  try {
    const response = await client.post(`/solved/${solvedId}/tag`, {
      tag_id: tagId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove tag from a problem
export const removeTagFromProblem = async (solvedId, tagId) => {
  try {
    const response = await client.delete(`/solved/${solvedId}/tag/${tagId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
