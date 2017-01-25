package it.smartcommunitylab.gipro.converter;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import com.google.common.collect.Lists;

import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceOfferUI;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.model.ServiceRequestUI;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

public class Converter {
	private static final transient Logger logger = LoggerFactory.getLogger(Converter.class);
	
	public static ServiceOfferUI convertServiceOffer(RepositoryManager storageManager, String applicationId, ServiceOffer serviceOffer) 
	{
		Professional professional = storageManager.findProfessionalById(applicationId, serviceOffer.getProfessionalId());
		ServiceOfferUI serviceOfferUI = new ServiceOfferUI();
		serviceOfferUI.setObjectId(serviceOffer.getObjectId());
		serviceOfferUI.setServiceType(serviceOffer.getServiceType());
		serviceOfferUI.setState(serviceOffer.getState());
		serviceOfferUI.setStartTime(serviceOffer.getStartTime());
		serviceOfferUI.setEndTime(serviceOffer.getEndTime());
		serviceOfferUI.setProfessional(professional);
		serviceOfferUI.setAddress(serviceOffer.getAddress());
		serviceOfferUI.setArea(serviceOffer.getArea());
		serviceOfferUI.setServiceSubtype(serviceOffer.getServiceSubtype());
		serviceOfferUI.setNote(serviceOffer.getNote());
		serviceOfferUI.setCost(serviceOffer.getCost());
		serviceOfferUI.setCoordinates(serviceOffer.getCoordinates());
		
		if (serviceOffer.getPoiId() != null) {
			Poi poi = storageManager.findPoiById(applicationId, serviceOffer.getPoiId());
			serviceOfferUI.setPoi(poi);
		}
		return serviceOfferUI;
	}
	public static List<ServiceOfferUI> convertServiceOffer(RepositoryManager storageManager,
			String applicationId, List<ServiceOffer> offerList) {
		List<ServiceOfferUI> result = Lists.newArrayList();
		for(ServiceOffer serviceOffer : offerList) {
			Professional professional = storageManager.findProfessionalById(applicationId, serviceOffer.getProfessionalId());
			ServiceOfferUI serviceOfferUI = new ServiceOfferUI();
			serviceOfferUI.setObjectId(serviceOffer.getObjectId());
			serviceOfferUI.setServiceType(serviceOffer.getServiceType());
			serviceOfferUI.setState(serviceOffer.getState());
			serviceOfferUI.setStartTime(serviceOffer.getStartTime());
			serviceOfferUI.setEndTime(serviceOffer.getEndTime());
			serviceOfferUI.setProfessional(professional);
			serviceOfferUI.setAddress(serviceOffer.getAddress());
			serviceOfferUI.setArea(serviceOffer.getArea());
			serviceOfferUI.setServiceSubtype(serviceOffer.getServiceSubtype());
			serviceOfferUI.setNote(serviceOffer.getNote());
			serviceOfferUI.setCost(serviceOffer.getCost());
			serviceOfferUI.setCoordinates(serviceOffer.getCoordinates());
			if (serviceOffer.getPoiId() != null) {
				Poi poi = storageManager.findPoiById(applicationId, serviceOffer.getPoiId());
				serviceOfferUI.setPoi(poi);
			}
			result.add(serviceOfferUI);
		}
		return result;
	}
	
	public static List<ServiceRequestUI> convertServiceRequest(RepositoryManager storageManager,
			String applicationId, List<ServiceRequest> requestList, boolean forRequester) {
		List<ServiceRequestUI> result = Lists.newArrayList();
		for(ServiceRequest serviceRequest : requestList) {
			ServiceRequestUI serviceRequestUI = new ServiceRequestUI();
			serviceRequestUI.setObjectId(serviceRequest.getObjectId()); 
			serviceRequestUI.setServiceType(serviceRequest.getServiceType());
			serviceRequestUI.setStartTime(serviceRequest.getStartTime());
			serviceRequestUI.setCustomProperties(serviceRequest.getCustomProperties());
			serviceRequestUI.setState(serviceRequest.getState());
			serviceRequestUI.setAddress(serviceRequest.getAddress());
			serviceRequestUI.setArea(serviceRequest.getArea());
			serviceRequestUI.setServiceSubtype(serviceRequest.getServiceSubtype());
			serviceRequestUI.setCost(serviceRequest.getCost());
			serviceRequestUI.setOfferId(serviceRequest.getOfferId());
			if (serviceRequest.getPoiId() != null) {
				Poi poi = storageManager.findPoiById(applicationId, serviceRequest.getPoiId());
				serviceRequestUI.setPoi(poi);
			}
			if (forRequester) {
				Professional professional = storageManager.findProfessionalById(applicationId, serviceRequest.getProfessionalId());
				serviceRequestUI.setProfessional(professional);
			} else {
				Professional professional = storageManager.findProfessionalById(applicationId, serviceRequest.getRequesterId());
				serviceRequestUI.setRequester(professional);
			}
			result.add(serviceRequestUI);
		}
		return result;
	}
	
	public static ServiceRequestUI convertServiceRequest(RepositoryManager storageManager,
			String applicationId, ServiceRequest serviceRequest) {
			ServiceRequestUI serviceRequestUI = new ServiceRequestUI();
			
			Professional professional = storageManager.findProfessionalById(applicationId, serviceRequest.getProfessionalId());
			serviceRequestUI.setProfessional(professional);
			professional = storageManager.findProfessionalById(applicationId, serviceRequest.getRequesterId());
			serviceRequestUI.setRequester(professional);

			serviceRequestUI.setObjectId(serviceRequest.getObjectId()); 
			serviceRequestUI.setServiceType(serviceRequest.getServiceType());
			serviceRequestUI.setStartTime(serviceRequest.getStartTime());
			serviceRequestUI.setCustomProperties(serviceRequest.getCustomProperties());
			serviceRequestUI.setState(serviceRequest.getState());
			serviceRequestUI.setAddress(serviceRequest.getAddress());
			serviceRequestUI.setArea(serviceRequest.getArea());
			serviceRequestUI.setServiceSubtype(serviceRequest.getServiceSubtype());
			serviceRequestUI.setCost(serviceRequest.getCost());
			serviceRequestUI.setOfferId(serviceRequest.getOfferId());
			if (serviceRequest.getPoiId() != null) {
				Poi poi = storageManager.findPoiById(applicationId, serviceRequest.getPoiId());
				serviceRequestUI.setPoi(poi);
			}
			return serviceRequestUI;
	}
	public static Professional convertRegistrationToProfessional(Registration registration) {
		Professional professional = new Professional();
		professional.setApplicationId(registration.getApplicationId());
		professional.setCf(registration.getCf());
		professional.setName(registration.getName());
		professional.setSurname(registration.getSurname());
		professional.setMail(registration.getMail());
		professional.setPec(registration.getPec());
		professional.setPhone(registration.getPhone());
		professional.setPiva(registration.getPiva());
		professional.setAlbo(registration.getAlbo());
		professional.setUsername(registration.getUsername());
		professional.setAddress(registration.getAddress());
		professional.setArea(registration.getArea());
		professional.setCoordinates(registration.getCoordinates());
		professional.setType(registration.getType());
		professional.setPasswordHash(registration.getPassword());
		professional.setBalance(registration.getBalance());
		professional.setNextBalanceUpdate(registration.getNextBalanceUpdate());
		if (StringUtils.hasText(registration.getCellPhone())) {
			professional.setCellPhone(registration.getCellPhone());
		}
		return professional;
	}

	
}
