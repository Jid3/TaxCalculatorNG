import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ParsedTime {
  hour: number;
  minute: number;
  id: string; // Unique identifier for the time slot
}

interface NotificationContextData {
  notificationTimes: ParsedTime[];
  addNotificationTime: (hour: number, minute: number) => Promise<void>;
  removeNotificationTime: (id: string) => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

const STORAGE_KEY = '@tax_naija_notification_times';

const DEFAULT_TIME: ParsedTime = {
  hour: 8, // 8:00 AM
  minute: 0,
  id: 'default-8am',
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificationTimes, setNotificationTimes] = useState<ParsedTime[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadTimes();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      rescheduleAllNotifications(notificationTimes);
    }
  }, [notificationTimes, hasPermission]);

  const checkPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    setHasPermission(finalStatus === 'granted');
    return finalStatus === 'granted';
  };

  const requestPermission = async () => {
    return await checkPermissions();
  };

  const loadTimes = async () => {
    try {
      const storedTimes = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTimes) {
        setNotificationTimes(JSON.parse(storedTimes));
      } else {
        // First time app launch, set default time
        setNotificationTimes([DEFAULT_TIME]);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_TIME]));
      }
    } catch (error) {
      console.error('Failed to load notification times:', error);
      // Fallback
      setNotificationTimes([DEFAULT_TIME]);
    }
  };

  const saveTimes = async (times: ParsedTime[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(times));
      setNotificationTimes(times);
    } catch (error) {
      console.error('Failed to save notification times:', error);
    }
  };

  const addNotificationTime = async (hour: number, minute: number) => {
    const id = `time-${Date.now()}`;
    const newTimes = [...notificationTimes, { hour, minute, id }];
    await saveTimes(newTimes);
  };

  const removeNotificationTime = async (id: string) => {
    const newTimes = notificationTimes.filter(t => t.id !== id);
    await saveTimes(newTimes);
  };

  const rescheduleAllNotifications = async (times: ParsedTime[]) => {
    // Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (times.length === 0) return;

    // Schedule new ones
    for (const time of times) {
      await scheduleDailyNotification(time.hour, time.minute);
    }
  };

  const scheduleDailyNotification = async (hour: number, minute: number) => {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Tax Reminder!",
            body: "Don't forget to record today's income and expenses in the TaxNaija app.",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hour,
            minute: minute,
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling notification for', hour, minute, error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationTimes,
        addNotificationTime,
        removeNotificationTime,
        hasPermission,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
