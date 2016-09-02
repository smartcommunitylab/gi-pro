package it.smartcommunitylab.gipro.model;

public class Poi extends BaseObject {
	private String objectId;
	private String name;
	private String address;
	private String region;
	private String type;
	private double[] coordinates;
	
	public String getObjectId() {
		return objectId;
	}
	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public double[] getCoordinates() {
		return coordinates;
	}
	public void setCoordinates(double[] coordinates) {
		this.coordinates = coordinates;
	}
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
}
