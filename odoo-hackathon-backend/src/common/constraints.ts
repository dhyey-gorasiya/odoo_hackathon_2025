import * as bcrypt from 'bcryptjs';


export const BYCRYPT_SALT_COST = 10;

export const message = {
  error: {
    user_not_found: "User Not Found",
    user_already_exists: "User already exists",
    invalid_credentials: "Invalid credentials",
    add_user_auth_failure: "Failed to add user auth",
    something_went_wrong: "Something Went Wrong !!",
    company_not_found: 'Company not found.',
    company_exists: 'A company with this name already exists.',
    invalid_company_id: 'Invalid company ID provided.',

    
  },
  success: {
    user_registered: "User registered successfully",
    login_successful: "Login successful",
    profile_updated: "Profile updated successfully",
    opt_send : "OTP has been sent to your email.",
    company_added: 'Company has been created successfully.',
    company_updated: 'Company details have been updated successfully.',
    company_deleted: 'Company has been deleted successfully.',
    company_fetched: 'Company details retrieved successfully.',
    companies_fetched: 'Companies retrieved successfully.',
    login_success: 'Login successful.',
  },
};

export const FOLDER_NAME = {
    ODOO_X_COMBAT: 'ODOO X COMBAT',
};

export const COLLECTION = {
  Auth: 'auth',       
  Profile: 'user_profile', 
  COMPANY : 'company',
  Company_auth : "company_auth"

};

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(BYCRYPT_SALT_COST);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const hashToken = (token: string): string => {
  const salt = bcrypt.genSaltSync(BYCRYPT_SALT_COST);
  const hash = bcrypt.hashSync(token, salt);
  return hash;
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

