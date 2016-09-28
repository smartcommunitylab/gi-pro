package it.smartcommunitylab.gipro.storage;

import it.smartcommunitylab.gipro.common.Const;
import it.smartcommunitylab.gipro.common.PasswordHash;
import it.smartcommunitylab.gipro.common.TranslationHelper;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.exception.AlreadyRegisteredException;
import it.smartcommunitylab.gipro.exception.InvalidDataException;
import it.smartcommunitylab.gipro.exception.NotRegisteredException;
import it.smartcommunitylab.gipro.exception.RegistrationException;
import it.smartcommunitylab.gipro.exception.UnauthorizedException;
import it.smartcommunitylab.gipro.model.Notification;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.model.ServiceApplication;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.push.NotificationManager;
import it.smartcommunitylab.gipro.security.DataSetInfo;
import it.smartcommunitylab.gipro.security.Token;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class RepositoryManager {
	private static final transient Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
	
	@Autowired
	private NotificationManager notificationManager;
	
	@Autowired
	private TranslationHelper translationHelper;
	
	private MongoTemplate mongoTemplate;
	private String defaultLang;
	
	public RepositoryManager(MongoTemplate template, String defaultLang) {
		this.mongoTemplate = template;
		this.defaultLang = defaultLang;
		this.mongoTemplate.indexOps(Poi.class).ensureIndex(new GeospatialIndex("coordinates"));
	}
	
	public String getDefaultLang() {
		return defaultLang;
	}

	public Token findTokenByToken(String token) {
		Query query = new Query(new Criteria("token").is(token));
		Token result = mongoTemplate.findOne(query, Token.class);
		return result;
	}
	
	public List<DataSetInfo> getDataSetInfo() {
		List<DataSetInfo> result = mongoTemplate.findAll(DataSetInfo.class);
		return result;
	}
	
	public void saveDataSetInfo(DataSetInfo dataSetInfo) {
		Query query = new Query(new Criteria("applicationId").is(dataSetInfo.getApplicationId()));
		DataSetInfo appInfoDB = mongoTemplate.findOne(query, DataSetInfo.class);
		if (appInfoDB == null) {
			mongoTemplate.save(dataSetInfo);
		} else {
			Update update = new Update();
			update.set("password", dataSetInfo.getPassword());
			update.set("token", dataSetInfo.getToken());
			mongoTemplate.updateFirst(query, update, DataSetInfo.class);
		}
	}
	
	public void saveAppToken(String name, String token) {
		Query query = new Query(new Criteria("name").is(name));
		Token tokenDB = mongoTemplate.findOne(query, Token.class);
		if(tokenDB == null) {
			Token newToken = new Token();
			newToken.setToken(token);
			newToken.setName(name);
			newToken.getPaths().add("/api");
			mongoTemplate.save(newToken);
		} else {
			Update update = new Update();
			update.set("token", token);
			mongoTemplate.updateFirst(query, update, Token.class);
		}
	}
	
	public List<?> findData(Class<?> entityClass, Criteria criteria, Sort sort, String applicationId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("applicationId").is(applicationId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("applicationId").is(applicationId));
		}
		if (sort != null) {
			query.with(sort);
		}
		query.limit(5000);
		List<?> result = mongoTemplate.find(query, entityClass);
		return result;
	}

	public <T> T findOneData(Class<T> entityClass, Criteria criteria, String applicationId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("applicationId").is(applicationId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("applicationId").is(applicationId));
		}
		T result = mongoTemplate.findOne(query, entityClass);
		return result;
	}
	
	public Poi addPoi(Poi poi) {
		poi.setObjectId(Utils.getUUID());
		Date now = new Date();
		poi.setCreationDate(now);
		poi.setLastUpdate(now);
		mongoTemplate.save(poi);
		return poi;
	}
	
	public Professional addProfessional(Professional professional) {
		professional.setObjectId(Utils.getUUID());
		Date now = new Date();
		professional.setCreationDate(now);
		professional.setLastUpdate(now);
		mongoTemplate.save(professional);
		return professional;
	}
	
	public void saveProfessionalbyCF(Professional professional) {
		Criteria criteria = new Criteria("applicationId").is(professional.getApplicationId())
				.and("cf").is(professional.getCf());
		Query query = new Query(criteria);
		Professional dbProfessional = mongoTemplate.findOne(query, Professional.class);
		if(dbProfessional == null) {
			professional.setObjectId(Utils.getUUID());
			Date now = new Date();
			professional.setCreationDate(now);
			professional.setLastUpdate(now);
			mongoTemplate.save(professional);
		}
	}
	
	public void updateProfessionalImageByCF(String applicationId, String cf, String image) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("cf").is(cf);
		Query query = new Query(criteria);
		Professional dbProfessional = mongoTemplate.findOne(query, Professional.class);
		if(dbProfessional != null) {
			Date now = new Date();
			Update update = new Update();
			update.set("imageUrl", image);
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, Professional.class);
		}
	}

	public void updateProfessional(String applicationId, Professional professional) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(professional.getObjectId());
		Query query = new Query(criteria);
		Professional dbProfessional = mongoTemplate.findOne(query, Professional.class);
		if(dbProfessional != null) {
			Date now = new Date();
			Update update = new Update();
			update.set("cellPhone", professional.getCellPhone());
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, Professional.class);
		}
	}
	
	private void updateProfessionalPasswordByCF(String applicationId, String cf, String passwordHash) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("cf").is(cf);
		Query query = new Query(criteria);
		Professional dbProfessional = mongoTemplate.findOne(query, Professional.class);
		if(dbProfessional != null) {
			Date now = new Date();
			Update update = new Update();
			update.set("passwordHash", passwordHash);
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, Professional.class);
		}
	}
	
	private Notification addNotification(Notification notification, String professionalId, String serviceType) {
		notification.setObjectId(Utils.getUUID());
		Date now = new Date();
		notification.setCreationDate(now);
		notification.setLastUpdate(now);
		Professional professional = findProfessionalById(notification.getApplicationId(), professionalId);
		String title = translationHelper.getNotificationTitle(professional.getLang(), notification.getType(), serviceType);
		String text = notificationText(professional.getLang(), notification.getType(), serviceType, notification.getApplicationId(), notification.getServiceOfferId(), notification.getServiceRequestId());
		notification.setText(text);
		
		push(notification, title);
		mongoTemplate.save(notification);
		return notification;
	}
	
	private String notificationText(String lang, String type, String serviceType, String applicationId, String serviceOfferId, String serviceRequestId) {
		Object[] params = null;
		switch(type) {
			// name/surname of the offering person; poi name, date/time of the request
			case Const.NT_NEW_SERVICE_OFFER: 
			case Const.NT_NEW_SERVICE_REQUEST: {
				ServiceOffer offer = getServiceOfferById(applicationId, null, serviceOfferId);
				Professional p = findProfessionalById(applicationId, offer.getProfessionalId());
				ServiceRequest request = getServiceRequestById(applicationId, null, serviceRequestId);
				Poi poi = findPoiById(applicationId, request.getPoiId());
				params = new String[]{ 
						p.getName(), 
						p.getSurname(), 
						poi.getName(),
						translationHelper.dateTime(request.getStartTime(), lang)
						};
			}
			// TODO
			case Const.NT_SERVICE_REQUEST_DELETED:
			case Const.NT_NEW_APPLICATION: 
			case Const.NT_APPLICATION_ACCEPTED: 
			case Const.NT_APPLICATION_REJECTED: 
			case Const.NT_APPLICATION_DELETED: 
		}
		return translationHelper.getNotificationText(lang, type, serviceType, params);
	}

	public Registration addRegistration(Registration registration) {
		Date now = new Date();
		registration.setCreationDate(now);
		registration.setLastUpdate(now);
		mongoTemplate.save(registration);
		return registration;
	}
	
	public void cleanPoi(String applicationId) {
		Query query = new Query(new Criteria("applicationId").is(applicationId));
		mongoTemplate.remove(query, Poi.class);
	}

	public void cleanProfessional(String applicationId) {
		Query query = new Query(new Criteria("applicationId").is(applicationId));
		mongoTemplate.remove(query, Professional.class);
	}
	
	public List<Professional> findProfessional(String applicationId, String type, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("type").is(type);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "surname", "name"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		filterProfessionalFields(query);
		List<Professional> result = mongoTemplate.find(query, Professional.class);
		return result;
	}

	public List<Professional> findProfessionalByIds(String applicationId, String[] idArray) {
		List<String> idList = Arrays.asList(idArray);
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").in(idList);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "surname", "name"));
		filterProfessionalFields(query);
		List<Professional> result = mongoTemplate.find(query, Professional.class);
		return result;
	}
	
	public Professional findProfessionalById(String applicationId, String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(professionalId);
		Query query = new Query(criteria);
		filterProfessionalFields(query);
		Professional result = mongoTemplate.findOne(query, Professional.class);
		return result;
	}
	
	public Professional findProfessionalByCF(String applicationId, String cf) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("cf").is(cf);
		Query query = new Query(criteria);
		filterProfessionalFields(query);
		Professional result = mongoTemplate.findOne(query, Professional.class);
		return result;
	}
	
	public List<Poi> findPoi(String applicationId, String type, String region, 
			Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("type").is(type);
		if(Utils.isNotEmpty(region)) {
			criteria = criteria.andOperator(new Criteria("region").is(region));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "name"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		List<Poi> result = mongoTemplate.find(query, Poi.class);
		return result;
	}

	public List<Poi> findPoiByIds(String applicationId, String[] idArray) {
		List<String> idList = Arrays.asList(idArray);
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").in(idList);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "name"));
		List<Poi> result = mongoTemplate.find(query, Poi.class);
		return result;
	}
	
	public Poi findPoiById(String applicationId, String poiId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").in(poiId);
		Query query = new Query(criteria);
		Poi result = mongoTemplate.findOne(query, Poi.class);
		return result;
	}

	public List<ServiceOffer> searchServiceOffer(String applicationId, 
			String professionalId, String serviceType, String poiId,
			Long startTime, Integer page,	Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("poiId").is(poiId)
				.and("serviceType").is(serviceType)
				.and("state").is(Const.STATE_OPEN)
				.and("professionalId").ne(professionalId);
		Criteria timeCriteria = new Criteria().andOperator(
				Criteria.where("startTime").lte(new Date(startTime)),
				Criteria.where("endTime").gte(new Date(startTime)));
		criteria = criteria.orOperator(new Criteria("startTime").exists(false), new Criteria("startTime").is(null), timeCriteria);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "creationDate"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		List<ServiceOffer> result = mongoTemplate.find(query, ServiceOffer.class);
		return result;
	}

	public ServiceOffer saveServiceOffer(ServiceOffer serviceOffer) {
		serviceOffer.setObjectId(Utils.getUUID());
		serviceOffer.setState(Const.STATE_OPEN);
		Date now = new Date();
		serviceOffer.setCreationDate(now);
		serviceOffer.setLastUpdate(now);
		mongoTemplate.save(serviceOffer);
		//search matching service requests
		List<ServiceRequest> matchingRequests = getMatchingRequests(serviceOffer);
		Date timestamp = new Date();
		for(ServiceRequest serviceRequest : matchingRequests) {
			// notify requestor
			Notification notification = new Notification();
			notification.setApplicationId(serviceOffer.getApplicationId());
			notification.setTimestamp(timestamp);
			notification.setProfessionalId(serviceRequest.getRequesterId());
			notification.setType(Const.NT_NEW_SERVICE_OFFER);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification, serviceRequest.getRequesterId(), serviceRequest.getServiceType());
			// notify myself about existing requests
			notification = new Notification();
			notification.setApplicationId(serviceOffer.getApplicationId());
			notification.setTimestamp(timestamp);
			notification.setProfessionalId(serviceOffer.getProfessionalId());
			notification.setType(Const.NT_NEW_SERVICE_REQUEST);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification, serviceOffer.getProfessionalId(), serviceOffer.getServiceType());
		}
		return serviceOffer;
	}

	private List<ServiceRequest> getMatchingRequests(ServiceOffer serviceOffer) {
		Criteria criteria = new Criteria("applicationId").is(serviceOffer.getApplicationId())
				.and("poiId").is(serviceOffer.getPoiId())
				.and("serviceType").is(serviceOffer.getServiceType())
				.and("state").is(Const.STATE_OPEN)
				.and("startTime").gte(new Date());
		if((serviceOffer.getStartTime() != null) && (serviceOffer.getEndTime() != null)) {
			criteria = criteria.andOperator(
					new Criteria("startTime").gte(serviceOffer.getStartTime()),
					new Criteria("startTime").lte(serviceOffer.getEndTime())
			);
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "creationDate"));
		List<ServiceRequest> result = mongoTemplate.find(query, ServiceRequest.class);
		return result;
	}
	
	public List<ServiceRequest> getMatchingRequests(String applicationId, String professionalId, String objectId) {
		ServiceOffer offer = getServiceOfferById(applicationId, professionalId, objectId);
		if (offer == null) return Collections.emptyList();
		return getMatchingRequests(offer);
	}
	public List<ServiceOffer> getMatchingOffers(String applicationId, String professionalId, String objectId) {
		ServiceRequest request = getServiceRequestById(applicationId, professionalId, objectId);
		if (request == null) return Collections.emptyList();
		return getMatchingOffers(request);
	}

	public ServiceRequest savePublicServiceRequest(ServiceRequest serviceRequest) {
		serviceRequest.setObjectId(Utils.getUUID());
		serviceRequest.setState(Const.STATE_OPEN);
		serviceRequest.setPrivateRequest(false);
		Date now = new Date();
		serviceRequest.setCreationDate(now);
		serviceRequest.setLastUpdate(now);
		mongoTemplate.save(serviceRequest);
		//search matching offers
		List<ServiceOffer> matchingOffers = getMatchingOffers(serviceRequest);
		Date timestamp = new Date();
		for(ServiceOffer serviceOffer : matchingOffers) {
			Notification notification = new Notification();
			notification.setApplicationId(serviceRequest.getApplicationId());
			notification.setTimestamp(timestamp);
			notification.setProfessionalId(serviceOffer.getProfessionalId());
			notification.setType(Const.NT_NEW_SERVICE_REQUEST);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification,serviceOffer.getProfessionalId(), serviceOffer.getServiceType());
		}
		return serviceRequest;
	}

	public ServiceRequest savePrivateServiceRequest(ServiceRequest serviceRequest) {
		serviceRequest.setObjectId(Utils.getUUID());
		serviceRequest.setState(Const.STATE_OPEN);
		serviceRequest.setPrivateRequest(true);
		Date now = new Date();
		serviceRequest.setCreationDate(now);
		serviceRequest.setLastUpdate(now);
		mongoTemplate.save(serviceRequest);
		//search matching offers
		List<ServiceOffer> matchingOffers = getMatchingOffers(serviceRequest);
		Date timestamp = new Date();
		for(ServiceOffer serviceOffer : matchingOffers) {
			Notification notification = new Notification();
			notification.setApplicationId(serviceRequest.getApplicationId());
			notification.setTimestamp(timestamp);
			notification.setProfessionalId(serviceOffer.getProfessionalId());
			notification.setType(Const.NT_NEW_SERVICE_REQUEST);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification,serviceOffer.getProfessionalId(), serviceOffer.getServiceType());
		}
		return serviceRequest;
	}

	private List<ServiceOffer> getMatchingOffers(ServiceRequest serviceRequest) {
		Criteria criteria = new Criteria("applicationId").is(serviceRequest.getApplicationId())
				.and("poiId").is(serviceRequest.getPoiId())
				.and("serviceType").is(serviceRequest.getServiceType())
				.and("state").is(Const.STATE_OPEN);
		if(serviceRequest.isPrivateRequest()) {
			criteria = criteria.andOperator(new Criteria("professionalId").in(serviceRequest.getRecipients()));
		}
		Criteria timeCriteria = new Criteria().andOperator(
				Criteria.where("startTime").lte(serviceRequest.getStartTime()),
				Criteria.where("endTime").gte(serviceRequest.getStartTime()));
		criteria = criteria.orOperator(new Criteria("startTime").exists(false), new Criteria("startTime").is(null), timeCriteria);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime", "creationDate"));
		List<ServiceOffer> result = mongoTemplate.find(query, ServiceOffer.class);
		return result;
	}
	
	public List<ServiceOffer> getServiceOffers(String applicationId, String professionalId,
			String serviceType, Long timeFrom, Long timeTo, Boolean withTime, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("professionalId").is(professionalId)
				.and("serviceType").is(serviceType);
		Criteria timeCriteria = null;
		if((timeFrom != null) && (timeTo != null)) {
			timeCriteria = new Criteria().andOperator(
				new Criteria("startTime").gte(new Date(timeFrom)),
				new Criteria("startTime").lte(new Date(timeTo))
			);
		} else if(timeFrom != null) {
			timeCriteria = new Criteria().andOperator(new Criteria("startTime").gte(new Date(timeFrom)));
		} else if(timeTo != null) {
			timeCriteria = new Criteria().andOperator(new Criteria("startTime").lte(new Date(timeTo)));
		}
		if (withTime == null) {
			if(timeCriteria != null) {
				criteria = criteria.orOperator(
						new Criteria("startTime").exists(false), 
						new Criteria("startTime").is(null),
						timeCriteria
				);
			}  
		} else if (withTime){
			if(timeCriteria != null) {
				criteria = criteria.andOperator(timeCriteria); 
			} else {
				criteria = criteria.and("startTime").exists(true);
			}
		} else {
			criteria = criteria.and("startTime").exists(false);
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime", "creationDate"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		List<ServiceOffer> result = mongoTemplate.find(query, ServiceOffer.class);
		return result;
	}

	public List<ServiceRequest> getServiceRequests(String applicationId, String professionalId,
			String serviceType, Long timeFrom, Long timeTo, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("requesterId").is(professionalId).and("serviceType").is(serviceType);
		if((timeFrom != null) && (timeTo != null)) {
			criteria = criteria.andOperator(
				new Criteria("startTime").gte(new Date(timeFrom)),
				new Criteria("startTime").lte(new Date(timeTo))
			);
		} else if(timeFrom != null) {
			criteria = criteria.andOperator(new Criteria("startTime").gte(new Date(timeFrom)));
		} else if(timeTo != null) {
			criteria = criteria.andOperator(new Criteria("startTime").lte(new Date(timeTo)));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		List<ServiceRequest> result = mongoTemplate.find(query, ServiceRequest.class);
		return result;
	}

	public ServiceOffer deleteServiceOffer(String applicationId, String objectId,
			String professionalId) {
		ServiceOffer result = null;
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId)
				.and("professionalId").is(professionalId);
		Query query = new Query(criteria);
		try {
			result = mongoTemplate.findOne(query, ServiceOffer.class);
			if(result != null) {
				mongoTemplate.findAndRemove(query, ServiceOffer.class);
			}
		} catch (Exception e) {
			logger.warn("deleteServiceOffer:" + e.getMessage());
		} 
		// TODO : consider notification for service offer deleted?
		return result;
	}

	public ServiceRequest deleteServiceRequest(String applicationId, String objectId,
			String professionalId) {
		ServiceRequest result = null;
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId)
				.and("requesterId").is(professionalId);
		Query query = new Query(criteria);
		try {
			result = mongoTemplate.findOne(query, ServiceRequest.class);
			if(result != null) {
				if(result.getState().equals(Const.STATE_OPEN)) {
					Date timestamp = new Date();
					for(ServiceApplication serviceApplication : result.getApplicants().values()) {
						if(serviceApplication.getState().equals(Const.SERVICE_APP_REQUESTED) ||
								serviceApplication.getState().equals(Const.SERVICE_APP_ACCEPTED)) {
							Notification notification = new Notification();
							notification.setApplicationId(applicationId);
							notification.setTimestamp(timestamp);
							notification.setProfessionalId(serviceApplication.getProfessionalId());
							notification.setType(Const.NT_SERVICE_REQUEST_DELETED);
							notification.setServiceRequestId(result.getObjectId());
							addNotification(notification,serviceApplication.getProfessionalId(), result.getServiceType());
						}
					}
				}
				mongoTemplate.findAndRemove(query, ServiceRequest.class);
			}
		} catch (Exception e) {
			logger.warn("deleteServiceOffer:" + e.getMessage());
		} 
		return result;
	}

	public List<ServiceRequest> getServiceRequestApplications(String applicationId,
			String professionalId, String serviceType, Long timestamp, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("applicants." + professionalId).exists(true).and("serviceType").is(serviceType);
		if(timestamp != null) {
			criteria = criteria.andOperator(new Criteria("startTime").gte(new Date(timestamp)));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		filterServiceRequestFields(professionalId, query);
		List<ServiceRequest> result = mongoTemplate.find(query, ServiceRequest.class);
		return result;
	}

	private void filterServiceRequestFields(String professionalId, Query query) {
		query.fields().include("objectId");
		query.fields().include("poiId");
		query.fields().include("startTime");
		query.fields().include("privateRequest");
		query.fields().include("state");
		query.fields().include("requesterId");
		query.fields().include("applicants." + professionalId);
		query.fields().include("customProperties");
		query.fields().include("serviceType");
	}
	
	private void filterProfessionalFields(Query query) {
		query.fields().exclude("username");
		query.fields().exclude("passwordHash");
	}

	public ServiceRequest applyToServiceRequest(String applicationId, String objectId,
			String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
		if(serviceRequest != null) {
			Date timestamp = new Date();
			//check if the professional hash already applyed
			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
			if(serviceApplication == null) {
				//add application
				serviceApplication = new ServiceApplication();
				serviceApplication.setTimestamp(timestamp);
				serviceApplication.setState(Const.SERVICE_APP_REQUESTED);
				serviceApplication.setProfessionalId(professionalId);
				serviceRequest.getApplicants().put(professionalId, serviceApplication);
				updateServiceApplication(query, serviceRequest);
				//add notification
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(timestamp);
				notification.setProfessionalId(serviceRequest.getRequesterId());
				notification.setType(Const.NT_NEW_APPLICATION);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification,serviceRequest.getRequesterId(), serviceRequest.getServiceType());
			}
			serviceRequest.getApplicants().clear();
			serviceRequest.getApplicants().put(professionalId, serviceApplication);
		}
		return serviceRequest;
	}
	
	public ServiceRequest rejectServiceApplication(String applicationId, String objectId,
			String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
		if(serviceRequest != null) {
			Date timestamp = new Date();
			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
			if(serviceApplication != null) {
				serviceApplication.setState(Const.SERVICE_APP_REJECTED);
				updateServiceApplication(query, serviceRequest);
				//add notification
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(timestamp);
				notification.setProfessionalId(serviceApplication.getProfessionalId());
				notification.setType(Const.NT_APPLICATION_REJECTED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification, serviceApplication.getProfessionalId(), serviceRequest.getServiceType());
			}
		}
		return serviceRequest;
	}

	public ServiceRequest acceptServiceApplication(String applicationId, String objectId,
			String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
		if(serviceRequest != null) {
			Date timestamp = new Date();
			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
			if(serviceApplication != null) {
				serviceApplication.setState(Const.SERVICE_APP_ACCEPTED);
				updateServiceApplication(query, serviceRequest);
				//add notification
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(timestamp);
				notification.setProfessionalId(serviceApplication.getProfessionalId());
				notification.setType(Const.NT_APPLICATION_ACCEPTED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification, professionalId, serviceRequest.getServiceType());	
			}
		}
		return serviceRequest;
	}

	private void push(Notification notification, String title) {
		try {
			notificationManager.sendNotification(
					title,
					notification, 
					notification.getProfessionalId());
		} catch (Exception e) {
			logger.error("Error sending push notification: "+ e.getMessage());
			e.printStackTrace();
		}
	}
	
	public ServiceRequest deleteServiceApplication(String applicationId, String objectId,
			String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
		if(serviceRequest != null) {
			Date timestamp = new Date();
			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
			if(serviceApplication != null) {
				serviceApplication.setState(Const.SERVICE_APP_DELETED);
				updateServiceApplication(query, serviceRequest);
				//add notification
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(timestamp);
				notification.setProfessionalId(serviceRequest.getRequesterId());
				notification.setType(Const.NT_APPLICATION_DELETED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification, serviceRequest.getRequesterId(), serviceRequest.getServiceType());				
			}
		}
		return serviceRequest;
	}
	
	private void updateServiceApplication(Query query, ServiceRequest serviceRequest) {
		Date now = new Date();
		Update update = new Update();
		update.set("applicants", serviceRequest.getApplicants());
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, ServiceRequest.class);
	}

	public List<Notification> getNotifications(String applicationId, String professionalId,
			Long timeFrom, Long timeTo, Boolean read, String type, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("professionalId").is(professionalId)
				.and("hidden").is(Boolean.FALSE);
		if((timeFrom != null) && (timeTo != null)) {
			criteria = criteria.andOperator(
				new Criteria("timestamp").gte(new Date(timeFrom)),
				new Criteria("timestamp").lte(new Date(timeTo))
			);
		} else if(timeFrom != null) {
			criteria = criteria.andOperator(new Criteria("timestamp").gte(new Date(timeFrom)));
		} else if(timeTo != null) {
			criteria = criteria.andOperator(new Criteria("timestamp").lte(new Date(timeTo)));
		}
		if(read != null) {
			criteria = criteria.andOperator(new Criteria("read").is(read));
		}
		if(Utils.isNotEmpty(type)) {
			criteria = criteria.andOperator(new Criteria("type").is(type));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "timestamp"));
		if(limit != null) {
			query.limit(limit);
		}
		if(page != null) {
			query.skip((page - 1) * limit);
		}
		List<Notification> result = mongoTemplate.find(query, Notification.class);
		return result;
	}

	public ServiceOffer getServiceOfferById(String applicationId, String professionalId,
			String objectId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceOffer result = mongoTemplate.findOne(query, ServiceOffer.class);
		return result;
	}

	public ServiceRequest getServiceRequestById(String applicationId, String professionalId,
			String objectId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceRequest result = mongoTemplate.findOne(query, ServiceRequest.class);
		return result;
	}

	public Notification readNotification(String applicationId, String objectId, String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId)
				.and("professionalId").is(professionalId);
		Query query = new Query(criteria);
		Notification notification = mongoTemplate.findOne(query, Notification.class);
		if(notification != null) {
			notification.setRead(true);
			updateNotification(query, notification);
		}
		return notification;
	}
	public void readOfferNotifications(String applicationId,String objectId, String professionalId) {
		Date now = new Date();
		Update update = new Update();
		update.set("read", true);
		update.set("lastUpdate", now);
		mongoTemplate.updateMulti(
				Query.query(new Criteria("serviceOfferId").is(objectId).and("professionalId").is(professionalId)), update, Notification.class);
	}
	public void readRequestNotifications(String applicationId,String objectId, String professionalId) {
		Date now = new Date();
		Update update = new Update();
		update.set("read", true);
		update.set("lastUpdate", now);
		mongoTemplate.updateMulti(
				Query.query(new Criteria("serviceRequestId").is(objectId).and("professionalId").is(professionalId)), update, Notification.class);
	}

	public Notification hiddenNotification(String applicationId, String objectId,
			String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId)
				.and("professionalId").is(professionalId);
		Query query = new Query(criteria);
		Notification notification = mongoTemplate.findOne(query, Notification.class);
		if(notification != null) {
			notification.setHidden(true);
			updateNotification(query, notification);
		}
		return notification;
	}

	private void updateNotification(Query query, Notification notification) {
		Date now = new Date();
		Update update = new Update();
		update.set("hidden", notification.isHidden());
		update.set("read", notification.isRead());
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, Notification.class);
	}

	public Registration registerUser(String applicationId, String cf, String password, String name,
			String surname, String mail) throws AlreadyRegisteredException, RegistrationException {
		Registration registration = new Registration();
		registration.setApplicationId(applicationId);
		registration.setCf(cf);
		registration.setPassword(password);
		registration.setName(name);
		registration.setSurname(surname);
		registration.setMail(mail);
		return registerUser(registration);
	}
	
	public Registration registerUser(Registration registration) 
			throws AlreadyRegisteredException, RegistrationException {
		try {
			Criteria criteria = new Criteria("applicationId").is(registration.getApplicationId())
					.and("cf").is(registration.getCf());
			Query query = new Query(criteria);
			Registration dbRegistration = mongoTemplate.findOne(query, Registration.class);
			if(dbRegistration != null) {
				throw new AlreadyRegisteredException("user already registered");
			}
			registration.setConfirmed(false);
			Calendar c = Calendar.getInstance();
			c.add(Calendar.DATE, 1);
			registration.setConfirmationDeadline(c.getTime());
			String confirmationKey = Utils.getUUID();
			registration.setConfirmationKey(confirmationKey);
			registration.setPassword(PasswordHash.createHash(registration.getPassword()));
			if(Utils.isEmpty(registration.getLang())) {
				registration.setLang("it");
			}
			addRegistration(registration);
			return registration;
		} catch (Exception e) {
			throw new RegistrationException(e);
		}
	}
	
	public Registration confirmUser(String confirmationKey) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("confirmationKey").is(confirmationKey);
		Query query = new Query(criteria);
		Registration dbRegistration = mongoTemplate.findOne(query, Registration.class);
		if(dbRegistration == null) {
			throw new NotRegisteredException("confirmationKey not found");
		}
		if(dbRegistration.getConfirmationDeadline().before(now)) {
			throw new InvalidDataException("confirmationKey exipired");
		}
		Update update = new Update();
		update.set("confirmed", Boolean.TRUE);
		update.set("confirmationKey", null);
		update.set("confirmationDeadline", null);
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, Registration.class);
		dbRegistration.setConfirmed(true);
		dbRegistration.setConfirmationKey(null);
		dbRegistration.setConfirmationDeadline(null);
		return dbRegistration;
	}

	public Registration resendConfirm(String cf) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("cf").is(cf).and("confirmed").is(Boolean.FALSE);
		Query query = new Query(criteria);
		Registration dbRegistration = mongoTemplate.findOne(query, Registration.class);
		if(dbRegistration == null) {
			throw new NotRegisteredException("confirmationKey not found");
		}
		Calendar c = Calendar.getInstance();
		c.add(Calendar.DATE, 1);
		String confirmationKey = Utils.getUUID();
		Update update = new Update();
		update.set("confirmationDeadline", c.getTime());
		update.set("confirmationKey", confirmationKey);
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, Registration.class);
		dbRegistration.setConfirmationDeadline(c.getTime());
		dbRegistration.setConfirmationKey(confirmationKey);
		return dbRegistration;
	}

	public Registration resetPassword(String cf) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("cf").is(cf).and("confirmed").is(Boolean.TRUE);
		Query query = new Query(criteria);
		Registration dbRegistration = mongoTemplate.findOne(query, Registration.class);
		if(dbRegistration == null) {
			throw new NotRegisteredException("confirmationKey not found");
		}
		Calendar c = Calendar.getInstance();
		c.add(Calendar.DATE, 1);
		String confirmationKey = Utils.getUUID();
		Update update = new Update();
		update.set("confirmationDeadline", c.getTime());
		update.set("confirmationKey", confirmationKey);
		update.set("password", null);
		update.set("confirmed", Boolean.FALSE);
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, Registration.class);
		dbRegistration.setConfirmationDeadline(c.getTime());
		dbRegistration.setConfirmationKey(confirmationKey);
		dbRegistration.setPassword(null);
		dbRegistration.setConfirmed(false);
		return dbRegistration;
	}

	public void updatePassword(String cf, String password, 
			String confirmationCode) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("cf").is(cf)
				.and("confirmationKey").is(confirmationCode)
				.and("confirmed").is(Boolean.FALSE);
		Query query = new Query(criteria);
		Registration dbRegistration = mongoTemplate.findOne(query, Registration.class);
		if(dbRegistration == null) {
			throw new NotRegisteredException("confirmationKey not found");
		}
		try {
			String newPassword = PasswordHash.createHash(password);
			Update update = new Update();
			update.set("confirmed", Boolean.TRUE);
			update.set("confirmationKey", null);
			update.set("confirmationDeadline", null);
			update.set("password", newPassword);
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, Registration.class);
			updateProfessionalPasswordByCF(dbRegistration.getApplicationId(), cf, newPassword);
		} catch (Exception e) {
			throw new RegistrationException(e.getMessage());
		}
	}

	public Professional loginByCF(String applicationId, String cf, String password) 
			throws Exception {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("cf").is(cf)
				.and("confirmed").is(Boolean.TRUE);
		Query query = new Query(criteria);
		Registration registration = mongoTemplate.findOne(query, Registration.class);
		if(registration == null) {
			throw new NotRegisteredException("profile not found");
		}
		boolean matches = PasswordHash.validatePassword(password, registration.getPassword());
		if (!matches) {
			throw new UnauthorizedException("invalid password");
		}
		criteria = new Criteria("applicationId").is(applicationId)
				.and("cf").is(cf);
		query = new Query(criteria);
		filterProfessionalFields(query);
		Professional professional = mongoTemplate.findOne(query, Professional.class);
		return professional;
	}


}
