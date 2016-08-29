package it.smartcommunitylab.gipro.model;

import java.util.Date;

public class ServiceOffer extends BaseObject {
	private String objectId;
	private String professionalId;
	private String poiId;
	private Date startTime;
	private Date endTime;
	private String state;
	
	public String getObjectId() {
		return objectId;
	}
	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}
	public String getPoiId() {
		return poiId;
	}
	public void setPoiId(String poiId) {
		this.poiId = poiId;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public Date getEndTime() {
		return endTime;
	}
	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getProfessionalId() {
		return professionalId;
	}
	public void setProfessionalId(String professionalId) {
		this.professionalId = professionalId;
	}
}
