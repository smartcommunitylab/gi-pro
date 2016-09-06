package it.smartcommunitylab.gipro.converter;

import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceOfferUI;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.collect.Lists;

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

	public static List<ServiceOfferUI> convertServiceOffer(RepositoryManager storageManager,
			String applicationId, List<ServiceOffer> offerList) {
		List<ServiceOfferUI> result = Lists.newArrayList();
		for(ServiceOffer serviceOffer : offerList) {
			Professional professional = storageManager.findProfessionalById(applicationId, serviceOffer.getProfessionalId());
			ServiceOfferUI serviceOfferUI = new ServiceOfferUI();
			serviceOfferUI.setObjectId(serviceOffer.getObjectId());
			serviceOfferUI.setPoiId(serviceOffer.getPoiId());
			serviceOfferUI.setServiceType(serviceOffer.getServiceType());
			serviceOfferUI.setState(serviceOffer.getState());
			serviceOfferUI.setStartTime(serviceOffer.getStartTime());
			serviceOfferUI.setEndTime(serviceOffer.getEndTime());
			serviceOfferUI.setProfessional(professional);
			result.add(serviceOfferUI);
		}
		return result;
	}
	
	public static Professional convertProfessional(Registration registration) {
		Professional professional = new Professional();
		professional.setApplicationId(registration.getApplicationId());
		professional.setCf(registration.getCf());
		professional.setName(registration.getName());
		professional.setSurname(registration.getSurname());
		professional.setMail(registration.getMail());
		professional.setPec(registration.getPec());
		professional.setPhone(registration.getPhone());
		professional.setPiva(registration.getPiva());
		professional.setUsername(registration.getUsername());
		professional.setPasswordHash(registration.getPassword());
		return professional;
	}
	
}
