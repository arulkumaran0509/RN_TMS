import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardOverviewScreen from '../screens/dashboard/DashboardOverviewScreen';
import ComplaintRaiseScreen from '../screens/complaints/ComplaintRaiseScreen';
import MyComplaintsScreen from '../screens/complaints/MyComplaintsScreen';
import ManageComplaintsScreen from '../screens/complaints/ManageComplaintsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Masters (SuperAdmin)
import DepartmentsScreen from '../screens/masters/DepartmentsScreen';
import ProgrammesScreen from '../screens/masters/ProgrammesScreen';
import BlocksScreen from '../screens/masters/BlocksScreen';
import RoomsScreen from '../screens/masters/RoomsScreen';
import RolesScreen from '../screens/masters/RolesScreen';
import UsersScreen from '../screens/masters/UsersScreen';

import CustomDrawerContent from './CustomDrawerContent';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import AppLoader from '../components/AppLoader';
import ScreenBackground from '../components/ScreenBackground';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom Tabs for Main Dashboard Flow (Profile removed per requirement 5)
const MainTabNavigator = ({ navigation }) => {
    const { roleName } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    const isStaff = [
        'SuperAdmin',
        'Networking Staff',
        'Plumber',
        'Electrician',
        'Technician',
        'Technical Staff',
    ].includes(roleName);
    const canRaise = ![
        'Networking Staff',
        'Plumber',
        'Electrician',
        'Technician',
        'Technical Staff',
    ].includes(roleName);

    const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
    const tabHeight = (Platform.OS === 'android' ? 64 : 60) + bottomPadding;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'OverviewTab') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'RaiseComplaint') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'MyComplaints') {
                        iconName = focused ? 'ticket' : 'ticket-outline';
                    } else if (route.name === 'ManageComplaints') {
                        iconName = focused ? 'build' : 'build-outline';
                    }

                    return (
                        <AnimatedTabIcon
                            focused={focused}
                            iconName={iconName}
                            color={color}
                            size={22}
                        />
                    );
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                    marginBottom: 2,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: COLORS.cardBackground,
                    borderTopColor: COLORS.borderLight,
                    borderTopWidth: 1,
                    height: tabHeight,
                    paddingTop: 8,
                    paddingBottom: bottomPadding,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                },
                headerStyle: {
                    backgroundColor: COLORS.cardBackground,
                },
                headerTitleStyle: {
                    fontWeight: '700',
                    color: COLORS.text,
                    fontSize: 18,
                },
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        style={styles.headerIconButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                        accessibilityLabel="Open navigation drawer"
                    >
                        <Ionicons name="menu" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                ),
            })}
        >
            <Tab.Screen
                name="OverviewTab"
                component={DashboardOverviewScreen}
                options={{
                    title: 'Overview',
                    headerTitle: 'TMS Pro Workspace',
                }}
            />

            {canRaise && (
                <Tab.Screen
                    name="RaiseComplaint"
                    component={ComplaintRaiseScreen}
                    options={{
                        title: 'Raise Ticket',
                        headerTitle: 'New Complaint',
                    }}
                />
            )}

            <Tab.Screen
                name="MyComplaints"
                component={MyComplaintsScreen}
                options={{
                    title: 'My Tickets',
                    headerTitle: 'Track My Tickets',
                }}
            />

            {isStaff && (
                <Tab.Screen
                    name="ManageComplaints"
                    component={ManageComplaintsScreen}
                    options={{
                        title: 'Manage',
                        headerTitle: 'Manage Complaints',
                    }}
                />
            )}
        </Tab.Navigator>
    );
};

// Helper to generate consistent header options for drawer sub-screens
const getSubScreenOptions = (title, navigation) => ({
    title,
    headerShown: true,
    headerLeft: () => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'OverviewTab' })}
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            accessibilityLabel="Go back to Overview"
        >
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
    ),
    headerRight: () => (
        <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={[styles.headerIconButton, { marginLeft: 0, marginRight: 16 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Open navigation drawer"
        >
            <Ionicons name="menu" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    ),
});

// Left-Side Drawer Navigator directly registering all application screens
const MainDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.cardBackground,
                },
                headerTitleStyle: {
                    fontWeight: '700',
                    color: COLORS.text,
                },
                headerTintColor: COLORS.primary,
                headerShadowVisible: false,
                drawerStyle: {
                    width: 300,
                    backgroundColor: COLORS.cardBackground,
                },
                swipeEdgeWidth: 100,
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={({ navigation }) => getSubScreenOptions('User Profile', navigation)}
            />
            <Drawer.Screen
                name="Departments"
                component={DepartmentsScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Departments', navigation)}
            />
            <Drawer.Screen
                name="Programmes"
                component={ProgrammesScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Programmes', navigation)}
            />
            <Drawer.Screen
                name="Blocks"
                component={BlocksScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Blocks', navigation)}
            />
            <Drawer.Screen
                name="Rooms"
                component={RoomsScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Rooms', navigation)}
            />
            <Drawer.Screen
                name="Roles"
                component={RolesScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Roles', navigation)}
            />
            <Drawer.Screen
                name="Users"
                component={UsersScreen}
                options={({ navigation }) => getSubScreenOptions('Manage Users', navigation)}
            />
        </Drawer.Navigator>
    );
};

export const AppNavigator = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <ScreenBackground>
                <AppLoader message="Initializing TMS Pro..." icon="construct-outline" />
            </ScreenBackground>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <Stack.Screen
                        name="MainDrawer"
                        component={MainDrawerNavigator}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    headerIconButton: {
        marginLeft: 16,
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
});

export default AppNavigator;
