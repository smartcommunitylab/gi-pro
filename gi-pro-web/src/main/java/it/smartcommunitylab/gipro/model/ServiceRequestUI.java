package it.smartcommunitylab.gipro.model;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.common.collect.Lists;

public class ServiceRequestUI {
	private String objectId;
	private Poi poi;
	private Date startTime;
	private boolean privateRequest;
	private String state;
	private String requesterId;
	private Map<String, ServiceApplication> applicants = new HashMap<String, ServiceApplication>();
	private List<String> recipients = Lists.newArrayList();
	private Map<String, Object> customProperties = new HashMap<String, Object>();
	private String serviceType;
	
	public String getObjectId() {
		return objectId;
	}
	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public boolean isPrivateRequest() {
		return privateRequest;
	}
	public void setPrivateRequest(boolean privateRequest) {
		this.privateRequest = privateRequest;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getRequesterId() {
		return requesterId;
	}
	public void setRequesterId(String requesterId) {
		this.requesterId = requesterId;
	}
	public Map<String, Object> getCustomProperties() {
		return customProperties;
	}
	public void setCustomProperties(Map<String, Object> customProperties) {
		this.customProperties = customProperties;
	}
	public List<String> getRecipients() {
		return recipients;
	}
	public void setRecipients(List<String> recipients) {
		this.recipients = recipients;
	}
	public String getServiceType() {
		return serviceType;
	}
	public void setServiceType(String serviceType) {
		this.serviceType = serviceType;
	}
	public Map<String, ServiceApplication> getApplicants() {
		return applicants;
	}
	public void setApplicants(Map<String, ServiceApplication> applicants) {
		this.applicants = applicants;
	}
	public Poi getPoi() {
		return poi;
	}
	public void setPoi(Poi poi) {
		this.poi = poi;
	}
}
