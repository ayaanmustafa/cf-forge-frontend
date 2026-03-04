import apiClient from './client';

export const syncProblems = async (handle) => {
  try {
    const response = await apiClient.post(`/sync/${handle}`);
    return response.data;
  } catch (error) {
    console.error('Error syncing problems:', error);
    throw error;
  }
};

export const fetchSolvedProblems = async (handle, filters = {}) => {
  try {
    const params = {
      min_rating: filters.ratingMin,
      max_rating: filters.ratingMax,
      skip: filters.skip || 0,
      limit: filters.limit || 50,
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    
    const response = await apiClient.get(`/solved/${handle}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    throw error;
  }
};

export const getProblemById = async (id) => {
  try {
    const response = await apiClient.get(`/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }
};

export const updateProblem = async (id, data) => {
  try {
    const response = await apiClient.patch(`/problems/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating problem:', error);
    throw error;
  }
};

export const searchAllProblems = async (minRating = 800, maxRating = 3500, skip = 0, limit = 50, contestId = null, name = null) => {
  try {
    const params = {
      min_rating: minRating,
      max_rating: maxRating,
      skip,
      limit,
    }
    if (contestId) {
      params.contest_id = contestId
    }
    if (name) {
      params.name = name
    }
    const response = await apiClient.get('/search/problems', { params })
    return response.data
  } catch (error) {
    console.error('Error searching problems:', error)
    throw error
  }
}

export const trackUnsolvedProblem = async (handle, problem) => {
  try {
    const response = await apiClient.post('/problem/track', {
      handle,
      contest_id: problem.contest_id,
      index: problem.index,
      name: problem.name,
      rating: problem.rating,
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking problem:', error);
    throw error;
  }
};

export const createProblem = async (data) => {
  try {
    const response = await apiClient.post('/problems', data);
    return response.data;
  } catch (error) {
    console.error('Error creating problem:', error);
    throw error;
  }
};
