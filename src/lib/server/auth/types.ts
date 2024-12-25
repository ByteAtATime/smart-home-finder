export interface IAuthProvider {
	isAuthenticated: () => boolean;
	getUserId: () => Promise<string | null>;
	isAdmin: () => Promise<boolean>;
}
