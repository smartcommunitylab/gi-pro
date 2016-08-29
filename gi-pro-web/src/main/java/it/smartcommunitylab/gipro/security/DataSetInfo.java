package it.smartcommunitylab.gipro.security;

import java.io.Serializable;

public class DataSetInfo implements Serializable {
	private static final long serialVersionUID = -130084868920590202L;

	private String ownerId;
	private String password;
	private String token;
	private String gameId;
	
	public String getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(String appId) {
		this.ownerId = appId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	@Override
	public String toString() {
		return ownerId + "=" + password;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getGameId() {
		return gameId;
	}

	public void setGameId(String gameId) {
		this.gameId = gameId;
	}

}
