import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image, // Import Image for illustration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Ionicons } from '@expo/vector-icons';
import { PUBLIC_SERVER_ENDPOINT } from '@env';

const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${PUBLIC_SERVER_ENDPOINT}/auth/login`, {
          emailOrName: email,
        password: password,
      }, {
        timeout: 10000, // Added timeout for consistency
      });

      const { accessToken } = response.data;

      if (accessToken) {
        const decodedUser = jwtDecode(accessToken);

        await AsyncStorage.setItem('accessToken', accessToken);
        console.log('accessToken when login success', accessToken);

        if (onLoginSuccess) {
          onLoginSuccess(accessToken, decodedUser);
        }

      } else {
        Alert.alert('Error', 'Login failed - no token received');
      }

    } catch (error) {

      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  // handleGoBack đã được thêm lại
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <>
    <View style={{ backgroundColor: '#00D4AA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#00D4AA" />
      <SafeAreaView>
       <View style={styles.header}>
       
        {/*<TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Đăng nhập với email</Text>
        <View style={styles.headerSpacer} />
      </View>
      </SafeAreaView>
      </View>
<SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Illustration Container - Added for consistency */}
          <View style={styles.illustrationContainer}>
            <Image
              source={{
                uri: 'https://placehold.co/120120/E0F7FA/00796B?text=Login'
              }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, emailError ? styles.textInputError : null]}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {email && validateEmail(email.trim()) && (
                <Ionicons name="checkmark-circle" size={20} color="#00D4AA" style={styles.validIcon} />
              )}
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, passwordError ? styles.textInputError : null]}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={isLoading}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading ? styles.loginButtonDisabled : null]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loginButtonText}>Đang đăng nhập...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerLinkText}>Đăng ký tài khoản mới</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00D4AA',
    flexDirection: 'row',
    alignItems: 'start',
    paddingHorizontal: 16,
    paddingVertical: 16, // Adjusted for consistency
    elevation: 2,
  },
  backButton: { // Giữ lại style này phòng trường hợp cần dùng lại
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginRight: 36,
  },
  headerSpacer: {
    width: 118,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  illustrationContainer: { // Added for consistency
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationImage: { // Added for consistency
    width: 120,
    height: 120,
  },
  inputContainer: {
    marginBottom: 30, // Adjusted for consistency
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 15,
    marginBottom: 5,
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  textInputError: {
    borderBottomColor: '#FF5252',
  },
  validIcon: {
    marginLeft: 10,
  },
  eyeButton: {
    padding: 5,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 35,
    lineHeight: 20, // Adjusted for consistency
  },
  loginButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});
