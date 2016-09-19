package it.smartcommunitylab.gipro.security;

import org.springframework.security.core.AuthenticationException;

public class JwtTokenMalformedException extends AuthenticationException {
	
	public JwtTokenMalformedException(String string) {
		super(string);
	}

	private static final long serialVersionUID = -8999792400831846883L;

}
