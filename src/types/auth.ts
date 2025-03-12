import { ReactElement } from 'react';

// ==============================|| AUTH TYPES ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

export type Token = string;

export type User = {
  id: number;
  email: string;
  external_client: string;
  rol: string;
  rol_id: number;
  name: string;
  area: any;
  conversations: any;
  phone_id_alias: string;
  conversations_from_whatsapp_clients: any;
  whatsapp_clients: any;
  televenta_id: number;
  sticky_rooms: any;
  borrowed_conversation_from: any;
  company_id: number;
  meli_user_id: any;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  company_name: string;
};
