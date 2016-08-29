package it.smartcommunitylab.gipro.converter;

import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.model.Poi;

import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

public class Converter {
	private static final transient Logger logger = LoggerFactory.getLogger(Converter.class);
	
	public static Poi convertPoi(String applicationId, JsonNode featureNode) {
		//TODO convertPoi
		String id = featureNode.get("properties").get("id").asText();
		String name = featureNode.get("properties").get("name").asText();
		String description = featureNode.get("properties").get("description").asText();
		String address = featureNode.get("properties").get("address").asText();
		String image = featureNode.get("properties").get("image").asText();
		String category = featureNode.get("properties").get("category").asText();
		String points = featureNode.get("properties").get("points").toString();
		JsonNode when = featureNode.get("properties").get("when");
		String coordinates = featureNode.get("geometry").get("coordinates").toString();
		if(Utils.isEmpty(id) || Utils.isEmpty(name) || Utils.isEmpty(description) || Utils.isEmpty(category) 
				|| Utils.isEmpty(address) || Utils.isEmpty(coordinates) || Utils.isEmpty(points)) {
			return null;
		}
		
		Poi poi = new Poi();
		poi.setObjectId(id);
		poi.setApplicationId(applicationId);
		poi.setName(name);
		poi.setAddress(address);
		
		double[] coordinatesArray = new double[2];
		if(featureNode.get("geometry").get("coordinates").isArray()) {
			ArrayNode arrayNode = (ArrayNode) featureNode.get("geometry").get("coordinates");
			int index = 0;
			for(JsonNode node : arrayNode) {
				coordinatesArray[index] = node.asDouble();
				index++;
			}
			poi.setCoordinates(coordinatesArray);
		}
		
		return poi;
	}
	
}
