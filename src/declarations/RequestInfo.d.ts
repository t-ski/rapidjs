declare interface ICompoundInfo {
	base: string;
	args: string[];
}

declare interface IRequestInfo {
    auth: string;
    ip: string;
    isCompound: boolean;
    pathname: string;
    searchParams: URLSearchParams;
    subdomain: string|string[];
}