import { BarChart } from 'react-native-chart-kit';
import { LibraryContext } from '../controllers/LibraryContext';
import { LibraryContextType } from '../types';
import { useContext } from 'react';
import { Dimensions, View, Text, ScrollView } from 'react-native';
import { appStyles } from '../styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const ChartsView: React.FC = () => {
  const { getBooksFor, getMaleAuthoredBooks, getFemaleAuthoredBooks } = useContext(LibraryContext) as LibraryContextType;
  const maleBooks = getMaleAuthoredBooks().length;
  const femaleBooks = getFemaleAuthoredBooks().length;
  const screenWidth = Dimensions.get('window').width;

  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [maleBooks, femaleBooks],
      },
    ],
  };

  const authorChartData = {
  labels: ['Shakespeare', 'Tolkien', 'Austen', 'Dickens', 'Orwell'],
  datasets: [
    {
      data: [
        getBooksFor('William Shakespeare').length,
        getBooksFor('J.R.R. Tolkien').length,
        getBooksFor('Jane Austen').length,
        getBooksFor('Charles Dickens').length,
        getBooksFor('George Orwell').length,
      ],
    },
  ]
};

  return (
    <SafeAreaProvider style={appStyles.container}>
      <ScrollView>
        <Text style={appStyles.header}>Books by Author Gender</Text>
        <BarChart
          data={genderChartData}
          width={screenWidth}
          height={250}
          chartConfig={chartGenderConfig}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
        />

        <BarChart
          data={authorChartData}
          width={screenWidth}
          height={250}
          chartConfig={chartAuthorConfig}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>
    </SafeAreaProvider>
  );
};

const chartGenderConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  fillShadowGradient: '#3c78f6',
  fillShadowGradientOpacity: 1,
  decimalPlaces: 0,
  color: () => '#3c78f6',
  labelColor: () => '#000000',
};

const chartAuthorConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  fillShadowGradient: '#65c466',
  fillShadowGradientOpacity: 1,
  decimalPlaces: 0,
  color: () => '#3c78f6',
  labelColor: () => '#000000',
};

export default ChartsView;