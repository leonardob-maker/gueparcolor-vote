export type Tally = {
  option_id: string;
  total: number;
  updated_at: string;
};

export type VoteFormState =
  | { status: "idle" }
  | { status: "success"; optionId: string; message: string }
  | { status: "error"; message: string; field?: "email" | "optionId" | "form" };

export type Database = {
  public: {
    Tables: {
      vote_options: {
        Row: { id: string; name: string; position: number; is_active: boolean; created_at: string };
      };
      vote_tallies: {
        Row: Tally;
      };
      votes: {
        Row: {
          id: string;
          option_id: string;
          email: string;
          email_key: string;
          display_name: string | null;
          consent_marketing: boolean;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          option_id: string;
          email: string;
          display_name?: string | null;
          consent_marketing?: boolean;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
      };
    };
  };
};