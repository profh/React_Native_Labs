export const fetchRepositories = async () => {
  try {
    const response = await fetch('https://api.github.com/search/repositories?q=language:swift&sort=stars&order=desc');
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
};