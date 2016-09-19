package it.smartcommunitylab.gipro.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

public class JwtAuthenticationToken extends UsernamePasswordAuthenticationToken {

	private String token;
	
	public JwtAuthenticationToken(String token) {
		super(token, "");
		this.token = token;
	}

	private static final long serialVersionUID = -955225923953222517L;

	public String getToken() {
		return token;
	}
}
