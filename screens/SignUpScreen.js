import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert, ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity
} from 'react-native';
import { supabase } from '../services/supabase'; // make sure path is correct

const SignUpScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      Alert.alert('Signup failed', error.message);
      return;
    }

    const userId = data.user.id;

    // Insert into your `users` table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        email,
        name,
        dob,
        phone,
      }
    ]);

    if (insertError) {
      Alert.alert('Error saving user profile', insertError.message);
      return;
    }

    Alert.alert('Signup Successful', 'You can now login!', [
      { text: 'OK', onPress: () => navigation.navigate('LoginScreen') }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Your Account</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        style={styles.input}
        value={dob}
        onChangeText={setDob}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text
        style={styles.linkText}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Already have an account? Login
      </Text>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2e7d32',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  button: {
    backgroundColor: '#43a047',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#1b5e20',
    fontWeight: '600',
  },
});
// This is the SignUpScreen component for user registration