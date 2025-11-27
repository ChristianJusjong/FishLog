declare module '@react-native-community/datetimepicker' {
  import { ComponentType } from 'react';
  
  export interface DateTimePickerEvent {
    type: string;
    nativeEvent: {
      timestamp?: number;
    };
  }
  
  export interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    disabled?: boolean;
  }
  
  const DateTimePicker: ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
