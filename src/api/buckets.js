import apiClient from './client';

export const fetchBuckets = async (handle) => {
  try {
    const response = await apiClient.get(`/bucket/${handle}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching buckets:', error);
    throw error;
  }
};

export const createBucket = async (handle, name) => {
  try {
    const response = await apiClient.post('/bucket', {
      handle,
      name,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }
};

export const viewBucket = async (bucketId) => {
  try {
    const response = await apiClient.get(`/bucket/view/${bucketId}`);
    return response.data;
  } catch (error) {
    console.error('Error viewing bucket:', error);
    throw error;
  }
};

export const addProblemToBucket = async (bucketId, problemId) => {
  try {
    const response = await apiClient.post(`/bucket/${bucketId}/add`, {
      problem_id: problemId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding problem to bucket:', error);
    throw error;
  }
};

export const removeProblemFromBucket = async (bucketId, problemId) => {
  try {
    const response = await apiClient.delete(`/bucket/${bucketId}/remove/${problemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing problem from bucket:', error);
    throw error;
  }
};

export const renameBucket = async (bucketId, newName) => {
  try {
    const response = await apiClient.put(`/bucket/${bucketId}/rename`, {
      new_name: newName,
    });
    return response.data;
  } catch (error) {
    console.error('Error renaming bucket:', error);
    throw error;
  }
};

export const deleteBucket = async (bucketId) => {
  try {
    const response = await apiClient.delete(`/bucket/${bucketId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bucket:', error);
    throw error;
  }
};
