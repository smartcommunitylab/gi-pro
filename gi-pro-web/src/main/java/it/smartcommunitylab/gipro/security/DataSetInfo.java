package it.smartcommunitylab.gipro.security;

import java.io.Serializable;

public class DataSetInfo implements Serializable {
	private static final long serialVersionUID = -130084868920590202L;

	private String applicationId;
	private String password;
	private String token;
	
	public String getApplicationId() {
		return applicationId;
	}
	
 	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	@Override
	public String toString() {
		return applicationId + "=" + password;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

}
