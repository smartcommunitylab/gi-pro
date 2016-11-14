package it.smartcommunitylab.gipro.model;

import java.util.Date;

public class ServiceOfferUI {
	private String objectId;
	private Professional professional;
	private Poi poi;
	private Date startTime;
	private Date endTime;
	private String state;
	private String serviceType;
	private String serviceSubtype;
	private String area, address;
	private String note;
	private Integer cost;
	private double[] coordinates;

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
	public String getServiceType() {
		return serviceType;
	}
	public void setServiceType(String serviceType) {
		this.serviceType = serviceType;
	}
	public Professional getProfessional() {
		return professional;
	}
	public void setProfessional(Professional professional) {
		this.professional = professional;
	}
	public Poi getPoi() {
		return poi;
	}
	public void setPoi(Poi poi) {
		this.poi = poi;
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
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public Integer getCost() {
		return cost;
	}
	public void setCost(Integer cost) {
		this.cost = cost;
	}
	public double[] getCoordinates() {
		return coordinates;
	}
	public void setCoordinates(double[] coordinates) {
		this.coordinates = coordinates;
	}
	
}
