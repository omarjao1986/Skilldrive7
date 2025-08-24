
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost, setApiBase, setToken } from './src/api';

const Stack = createNativeStackNavigator();
function Button({ title, onPress }){ return (<TouchableOpacity onPress={onPress} style={{padding:12,backgroundColor:'#0ea5e9',borderRadius:10}}><Text style={{color:'#fff',fontWeight:'700'}}>{title}</Text></TouchableOpacity>); }

function Login({ navigation }){
  const [phone,setPhone]=useState('+212600000000'); const [code,setCode]=useState('0000');
  const [name,setName]=useState('Omar'); const [role,setRole]=useState('CLIENT'); const [api,setApi]=useState('http://10.0.2.2:4000');
  useEffect(()=>setApiBase(api),[api]);
  async function ask(){ try{ await apiPost('/auth/otp/request',{phone}); Alert.alert('Code envoyé','En dev: 0000'); }catch(e){ Alert.alert('Erreur', String(e)); } }
  async function verify(){ try{ const r=await apiPost('/auth/otp/verify',{phone,code,name,role}); await AsyncStorage.setItem('token',r.token); setToken(r.token); navigation.replace('Home'); }catch(e){ Alert.alert('Erreur', String(e)); } }
  return (<View style={{flex:1,padding:16, gap:10}}>
    <Text style={{fontSize:28,fontWeight:'800'}}>Skilldrive</Text>
    <TextInput value={api} onChangeText={setApi} style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10}} placeholder='API URL' />
    <TextInput value={phone} onChangeText={setPhone} style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10}} placeholder='Téléphone' />
    <TextInput value={name} onChangeText={setName} style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10}} placeholder='Nom' />
    <View style={{flexDirection:'row',gap:8}}>
      <Button title={role==='CLIENT'?'Client ✓':'Client'} onPress={()=>setRole('CLIENT')} />
      <Button title={role==='PRO'?'Pro ✓':'Pro'} onPress={()=>setRole('PRO')} />
    </View>
    <View style={{flexDirection:'row',gap:8}}>
      <Button title='Recevoir le code' onPress={ask} />
      <TextInput value={code} onChangeText={setCode} style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10,flex:1}} placeholder='Code 0000' />
      <Button title='Se connecter' onPress={verify} />
    </View>
  </View>);
}

function Home({ navigation }){
  const [list,setList]=useState([]); const [loading,setLoading]=useState(true);
  const [q,setQ]=useState(''); const [near,setNear]=useState(''); const [radiusKm,setR]=useState('10');
  useEffect(()=>{ (async()=>{ const t=await AsyncStorage.getItem('token'); if(t) setToken(t); refresh(); })(); },[]);
  async function refresh(){ setLoading(true); try{ const p=new URLSearchParams(); if(q) p.set('q',q); if(near&&radiusKm){ p.set('near',near); p.set('radiusKm',radiusKm);} const data=await apiGet('/requests?'+p.toString()); setList(data);}catch(e){ Alert.alert('Erreur',String(e)); } finally{ setLoading(false);}}
  async function here(){ const { status }=await Location.requestForegroundPermissionsAsync(); if(status!=='granted') return; const pos=await Location.getCurrentPositionAsync({}); setNear(pos.coords.latitude+','+pos.coords.longitude); refresh(); }
  return (<View style={{flex:1,padding:16, gap:8}}>
    <View style={{flexDirection:'row',gap:8}}>
      <TextInput value={q} onChangeText={setQ} placeholder='Recherche' style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10,flex:1}} />
      <Button title='Chercher' onPress={refresh} />
    </View>
    <View style={{flexDirection:'row',gap:8}}>
      <TextInput value={near} onChangeText={setNear} placeholder='lat,lng' style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10,flex:1}} />
      <TextInput value={radiusKm} onChangeText={setR} placeholder='rayon km' style={{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10,width:100}} />
      <Button title='Autour de moi' onPress={here} />
    </View>
    {loading? <ActivityIndicator/> : <FlatList data={list} keyExtractor={(it)=>it.id} renderItem={({item})=>(
      <View style={{borderWidth:1,borderColor:'#eee',borderRadius:10,padding:12,marginVertical:6}}>
        <Text style={{fontWeight:'700'}}>{item.title}</Text>
        <Text numberOfLines={2} style={{color:'#444'}}>{item.description}</Text>
        <Text style={{fontWeight:'700'}}>{item.budgetMAD} MAD</Text>
      </View>
    )}/>}
  </View>);
}

export default function App(){
  return (<NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name='Login' component={Login} options={{headerShown:false}} />
      <Stack.Screen name='Home' component={Home} options={{title:'Demandes'}} />
    </Stack.Navigator>
  </NavigationContainer>);
}
