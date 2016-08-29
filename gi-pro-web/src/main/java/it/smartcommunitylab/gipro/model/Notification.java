package it.smartcommunitylab.gipro.model;

import java.util.Date;

public class Notification extends BaseObject {
	private String objectId;
	private String professionalId;
	private Date timestamp;
	private String text;
	private String state;
	private String serviceOfferId;
	private String serviceRequestId;
	
	public String getObjectId() {
		return objectId;
	}
	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}
	public String getProfessionalId() {
		return professionalId;
	}
	public void setProfessionalId(String professionalId) {
		this.professionalId = professionalId;
	}
	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getServiceOfferId() {
		return serviceOfferId;
	}
	public void setServiceOfferId(String serviceOfferId) {
		this.serviceOfferId = serviceOfferId;
	}
	public String getServiceRequestId() {
		return serviceRequestId;
	}
	public void setServiceRequestId(String serviceRequestId) {
		this.serviceRequestId = serviceRequestId;
	}
}
