import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TextInput, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { styles } from '../styles/AppStyles';
import { fetchRepositories } from '../services/RepositoryService';
import { RepositoryRow } from '../components/RepositoryRow';

export const HomeScreen = () => {
  const [repositories, setRepositories] = useState([]);
  const [displayedRepos, setDisplayedRepos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const repos = await fetchRepositories();
    setRepositories(repos);
    setDisplayedRepos(repos);
    setLoading(false);
  };

  useEffect(() => {
    filterRepositories();
  }, [searchText, repositories]);

  const filterRepositories = () => {
    if (searchText === '') {
      setDisplayedRepos(repositories);
    } else {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setDisplayedRepos(filtered);
    }
  };

  const openRepository = async (repository) => {
    try {
      await WebBrowser.openBrowserAsync(repository.html_url);
    } catch (error) {
      Alert.alert('Error', 'Could not open repository URL');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading repositories...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
        <FlatList
          data={displayedRepos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RepositoryRow
              repository={item}
              onPress={() => openRepository(item)}
            />
          )}
          style={styles.list}
        />
      </View>
    );
  }
}