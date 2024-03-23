import Icon from 'react-native-vector-icons/FontAwesome';
import React, { useEffect, useState } from "react";
import { Text, SafeAreaView, View, StyleSheet, Image,ScrollView,FlatList,Button,TouchableNativeFeedback,TextInput, TouchableWithoutFeedback, TouchableOpacity, SearchBar, Dimensions  } from 'react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const renderItem =({ item }) => ( <TouchableOpacity onPress={() => item.navigation.navigate('About', { 'id' : item.i+1 })}><SelectPokemon style ={styles.test} id = {item.i+1} navigation = {item.navigation}/></TouchableOpacity>);
const HomeScreen = ({ navigation }) => {
  navigation.setOptions( {title: "Pokédex", headerTitleStyle: styles.title});
 const[text, setText]= useState('');
 const selectPokemons = [...Array(parseInt(2000)).keys()].map(i=>{return {i:i, navigation:navigation}});
 
 
  return(<SafeAreaView  style={styles.title}>
            <TextInput
        style={
          {
            borderColor: "black", 
            height: 40
            }
          } 
        placeholder="Search" 
        onChangeText={newText => setText(newText)} 
        defaultValue={text}/>
      <Button title={"Search"} onPress={() => navigation.navigate('Search', { id : text.toLowerCase()})}></Button>
      <FlatList data={selectPokemons} renderItem={renderItem} keyExtractor={item => item.i} numColumns={2}/>
    </SafeAreaView >)
          
};




const typeColor = {normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C", grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1", ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A", rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark:"#705746", steel:"#B7B7CE", fairy: "#D685AD"};
const SelectPokemon = ({ id }) =>{  
  const [data, setData] = useState('');
  useEffect(() => fetch('https://pokeapi.co/api/v2/pokemon/' + id)
    .then(r=>r.json())
    .then(s=>setData(s)),[id]);
      return (!data ? <View></View> : 
      <View>
        <Card style = {{paddingLeft: 3, margin: 3,borderRadius : 30, backgroundColor: typeColor[data['types'][0]['type']['name']]}}>
          <Image source={{uri: data['sprites']['other']['official-artwork']['front_default']}} style={{width: windowWidth/2.1, height: windowWidth/2.1}}/>
          <Text style={styles.name}> {data['name'] == 'beedrill' ? 'bigdickbee' : data['name']} </Text>
          <Text style={{fontSize:15,
      fontFamily: "FontAwesome",
      color: "white",
      fontWeight: "bold",
      alignSelf: "center",textAlign: "center",overflow: "hidden"}}>

            {data['types'][1] ? data['types'][0]['type']['name'] + " / " + data['types'][1]['type']['name'] : data['types'][0]['type']['name']}
          </Text>

        </Card>
      </View>
      );

}


const SearchComp = ({ navigation, route }) =>{
  
  const [imageURL, setImageURL] = useState('');
  const [isOK, setOK] = useState('');
    useEffect(() => fetch('https://pokeapi.co/api/v2/pokemon/' + route.params.id)
          .then((response) => {
            if(response.ok){
              setOK(true);       
            }
          })       
        );  
        if(isOK && route.params.id != ''){
          navigation.navigate('Home');
          navigation.navigate('About',{id: route.params.id});
          return null;
        }else{
                return (<View>
                      <Text>Pokemon Not Found</Text>
                      <Button title="Search Again" onPress={() => navigation.goBack()} />
                    </View>);          
        }      
 
  };










const AboutComp = ({ navigation, route }) => {
  const [imageURL, setImageURL] = useState('');
      useEffect(() => fetch('https://pokeapi.co/api/v2/pokemon/'+route.params.id)
               .then(response => response.json())
               .then(data => data['sprites']['front_default'])
               .then(url => setImageURL(url)),[route.params.id]);
      return (<View>
                <Image source={{uri: imageURL}} style={{width: 400, height: 400}}/>
                <Button title="Go back" onPress={() => navigation.goBack()} />
              </View>);
};
const EvolutionComp = ({ navigation, route }) =>{  }


export default function App() {
  return (
    
    <NavigationContainer>
      <Stack.Navigator options={{gestureEnabled: 'true'}}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Select A Pokemon' }}/>
        <Stack.Screen name="About" component={AboutComp} />
        <Stack.Screen name="Evolution" component={EvolutionComp} />
        <Stack.Screen name="Search" component={SearchComp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    test: {
      flex: 1,
      width: "100%",
    },
    title:{
      fontSize: 50,
      textAlign: "center",
      fontFamily: "fantasy",
      backgroundColor: "white",
    },
    name:{
      fontSize:17,
      fontFamily: "FontAwesome",
      fontWeight: "bold",
      textTransform: 'uppercase',
      textAlign: "center",
    },
    
  });