import { useAppSelector } from "../store";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  return {
    ...auth,
    isAdmin: auth.user?.role === "admin",
    isManager: auth.user?.role === "manager",
  };
};

export default useAuth;
