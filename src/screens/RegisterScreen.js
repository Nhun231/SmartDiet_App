import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePickerModal from "react-native-modal-datetime-picker"; 
import {PUBLIC_SERVER_ENDPOINT} from "@env"
const BASE_URL = PUBLIC_SERVER_ENDPOINT;

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState(null); 
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [dobError, setDobError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };


  const handleConfirmDate = (date) => {
    setDob(date); 
    setDobError(''); 
    hideDatePicker();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };


  const validateDobField = () => {
    setDobError('');
    if (!dob) {
      setDobError('Vui lòng chọn ngày sinh');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (dob > today) {
      setDobError('Ngày sinh không thể là tương lai');
      return false;
    }
    return true;
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (usernameError) {
      setUsernameError('');
    }
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
    if (confirmPassword && confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const validateForm = () => {
    let isValid = true;

    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setDobError(''); 

    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên người dùng');
      isValid = false;
    }

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
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        let errorMessage = 'Mật khẩu phải có:';
        if (!passwordValidation.hasMinLength) errorMessage += '\n• Ít nhất 8 ký tự';
        if (!passwordValidation.hasUpperCase) errorMessage += '\n• Ít nhất 1 chữ hoa';
        if (!passwordValidation.hasLowerCase) errorMessage += '\n• Ít nhất 1 chữ thường';
        if (!passwordValidation.hasNumbers) errorMessage += '\n• Ít nhất 1 số';
        if (!passwordValidation.hasSpecialChar) errorMessage += '\n• Ít nhất 1 ký tự đặc biệt';
        
        setPasswordError(errorMessage);
        isValid = false;
      }
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      isValid = false;
    }

    // Validate date of birth using the new function
    if (!validateDobField()) {
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Format the Date object to YYYY-MM-DD string for the backend
      const formattedDob = dob ? 
        `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}` 
        : '';

      const response = await axios.post(`${BASE_URL}/users/create`, {
        username: username.trim(),
        email: email.trim(),
        password: password,
        dob: formattedDob, // Use the formatted date of birth
      }, {
        timeout: 10000 
      });
      
      if (response.status === 201) {
        Alert.alert(
          "Đăng ký thành công",
          "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        // Clear form fields on successful registration
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
        setDob(null); // Clear selected date
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        if (error.response.status === 400) {
          const backendMessage = error.response.data.message;
          if (backendMessage && backendMessage.includes('Email này đã có người sử dụng')) {
            setEmailError('Email này đã có người sử dụng');
          } else if (backendMessage) {
            // If there's a specific message from the backend for a 400 error, display it
            Alert.alert("Lỗi", backendMessage);
          } else {
            // Fallback for 400 if no specific message is provided by the backend
            Alert.alert("Lỗi", "Đăng ký thất bại do dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
          }
        } else {
          // For any other HTTP status code error
          Alert.alert("Lỗi", error.response.data.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else if (error.request) {
        // The request was made but no response was received (e.g., network error)
        Alert.alert("Lỗi", "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc địa chỉ BASE_URL.");
      } else {
        // Something happened in setting up the request that triggered an Error
        Alert.alert("Lỗi", "Đăng ký thất bại không xác định. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D4AA" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký tài khoản</Text>
        <View style={styles.headerSpacer} />
      </View>

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
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  usernameError ? styles.textInputError : null
                ]}
                placeholder="Tên người dùng"
                placeholderTextColor="#999"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  emailError ? styles.textInputError : null
                ]}
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
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  passwordError ? styles.textInputError : null
                ]}
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
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  confirmPasswordError ? styles.textInputError : null
                ]}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!isConfirmPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            {/* Date of Birth Input with Date Picker */}
            <TouchableOpacity 
              style={[
                styles.inputWrapper, 
                styles.datePickerTrigger, 
                dobError ? styles.textInputError : null
              ]} 
              onPress={showDatePicker}
              disabled={isLoading}
            >
              <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
              <Text style={[styles.textInput, dob ? styles.dateText : styles.placeholderText]}>
                {dob ? `${String(dob.getDate()).padStart(2, '0')}/${String(dob.getMonth() + 1).padStart(2, '0')}/${dob.getFullYear()}` : "Ngày sinh"}
              </Text>
            </TouchableOpacity>
            {dobError ? (
              <Text style={styles.errorText}>{dobError}</Text>
            ) : null}

          </View>

          <TouchableOpacity 
            style={[
              styles.registerButton,
              isLoading ? styles.registerButtonDisabled : null
            ]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.registerButtonText}>Đang đăng ký...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={handleLoginNavigation}
            disabled={isLoading}
          >
            <Text style={styles.loginLinkText}>Bạn đã có tài khoản? Đăng nhập ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={dob || new Date()} // Set initial date to selected DOB or current date
        maximumDate={new Date()} // Prevent selecting future dates
        locale="vi-VN" // Set locale for Vietnamese date format and names
        headerTextIOS="Chọn ngày sinh của bạn" // Custom header text for iOS
        confirmTextIOS="Xác nhận" // Custom confirm button text for iOS
        cancelTextIOS="Hủy" // Custom cancel button text for iOS
      />
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    marginRight: 0,
  },
  headerSpacer: {
    width: 36,
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
    paddingTop: 0, 
    paddingBottom: 30,
    justifyContent: 'center', 
  },
  inputContainer: {
    marginBottom: 30,
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
    lineHeight: 20,
  },
  registerButton: {
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
  registerButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  // New styles for date picker trigger
  datePickerTrigger: {
    marginTop: 10, // Add some space above the date picker
  },
  dateText: {
    color: '#333', // Color for selected date
  },
  placeholderText: {
    color: '#999', // Color for placeholder text
  },
});
