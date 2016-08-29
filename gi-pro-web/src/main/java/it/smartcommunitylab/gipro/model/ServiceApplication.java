package it.smartcommunitylab.gipro.model;

import java.util.Date;

public class ServiceApplication {
	private String professionalId;
	private String state;
	private Date timestamp;
	
	public String getProfessionalId() {
		return professionalId;
	}
	public void setProfessionalId(String professionalId) {
		this.professionalId = professionalId;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
}
