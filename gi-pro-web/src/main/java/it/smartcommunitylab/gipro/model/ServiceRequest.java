package it.smartcommunitylab.gipro.model;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class ServiceRequest extends BaseObject {
	private String objectId;
	private String requesterId;

	private String offerId;
	private String professionalId;
	
	private String poiId;
	private Date startTime;
	private String state;
	private Map<String, Object> customProperties = new HashMap<String, Object>();
	private String serviceType;
	private String serviceSubtype;
	private String area, address;
	private Integer cost;

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
	public String getServiceType() {
		return serviceType;
	}
	public void setServiceType(String serviceType) {
		this.serviceType = serviceType;
	}
	public String getServiceSubtype() {
		return serviceSubtype;
	}
	public void setServiceSubtype(String serviceSubtype) {
		this.serviceSubtype = serviceSubtype;
	}
	public String getArea() {
		return area;
	}
	public void setArea(String area) {
		this.area = area;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getOfferId() {
		return offerId;
	}
	public void setOfferId(String offerId) {
		this.offerId = offerId;
	}
	public Integer getCost() {
		return cost;
	}
	public void setCost(Integer cost) {
		this.cost = cost;
	}
}

