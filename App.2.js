import React, {useCallback, useState, useEffect} from 'react';
import {StyleSheet, Text, View, FlatList, ScrollView} from 'react-native';

import _ from 'lodash';

let Item = ({item, index}) => (
  <View
    style={{
      top: index * 100,
      width: '100%',
      height: 100,
      borderWidth: 1,
      position: 'absolute',
    }}
    key={index}>
    <Text>{item}</Text>
  </View>
);

Item = React.memo(Item, (prevProps, nextProps) => {
  return nextProps.index > 3;
});

const App = () => {
  const [data, setData] = useState(() => _.range(10));

  useEffect(() => {
    const timer = setInterval(() => {
      setData((p) => _.map(p, () => _.random(100, false)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderItem = useCallback((p) => <Item {...p} />, []);

  return (
    <ScrollView>
      {_.map(data, (item, index) => renderItem({item, index}))}
    </ScrollView>
  );

  return <FlatList data={data} renderItem={renderItem} />;
};

export default App;

const styles = StyleSheet.create({});
