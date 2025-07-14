import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiaryScreen from '../screens/DiaryScreen';
import InitialCalculateScreen from '../screens/InitialCalculateScreen';

const Stack = createNativeStackNavigator();

export default function DiaryNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DiaryMain" component={DiaryScreen} />
            <Stack.Screen name="InitialCalculateScreen" component={InitialCalculateScreen} />
        </Stack.Navigator>
    );
}
