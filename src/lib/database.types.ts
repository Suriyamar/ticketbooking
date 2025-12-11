export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shows: {
        Row: {
          id: string;
          name: string;
          type: 'show' | 'trip' | 'appointment';
          start_time: string;
          total_seats: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'show' | 'trip' | 'appointment';
          start_time: string;
          total_seats?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'show' | 'trip' | 'appointment';
          start_time?: string;
          total_seats?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          show_id: string;
          seat_number: number | null;
          user_name: string;
          user_email: string;
          status: 'PENDING' | 'CONFIRMED' | 'FAILED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          show_id: string;
          seat_number?: number | null;
          user_name: string;
          user_email: string;
          status?: 'PENDING' | 'CONFIRMED' | 'FAILED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          show_id?: string;
          seat_number?: number | null;
          user_name?: string;
          user_email?: string;
          status?: 'PENDING' | 'CONFIRMED' | 'FAILED';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
