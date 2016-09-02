package it.smartcommunitylab.gipro.storage;

import it.smartcommunitylab.gipro.common.Const;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.model.Notification;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.ServiceApplication;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.security.DataSetInfo;
import it.smartcommunitylab.gipro.security.Token;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class RepositoryManager {
	private static final transient Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
	
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
	
	public Notification addNotification(Notification notification) {
		notification.setObjectId(Utils.getUUID());
		Date now = new Date();
		notification.setCreationDate(now);
		notification.setLastUpdate(now);
		mongoTemplate.save(notification);
		return notification;
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
		query.limit(limit);
		query.skip((page - 1) * limit);
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
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").in(professionalId);
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
		query.limit(limit);
		query.skip((page - 1) * limit);
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
			Notification notification = new Notification();
			notification.setApplicationId(serviceOffer.getApplicationId());
			notification.setTimestamp(timestamp);
			notification.setProfessionalId(serviceRequest.getRequesterId());
			notification.setType(Const.NEW_SERVICE_OFFER);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification);
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
			notification.setType(Const.NEW_SERVICE_REQUEST);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification);
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
			notification.setType(Const.NEW_SERVICE_REQUEST);
			notification.setServiceOfferId(serviceOffer.getObjectId());
			notification.setServiceRequestId(serviceRequest.getObjectId());
			addNotification(notification);
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
			String serviceType, Long timeFrom, Long timeTo, Integer page, Integer limit) {
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
			timeCriteria = new Criteria().andOperator(new Criteria("startTime").lte(new Date(timeFrom)));
		} else if(timeTo != null) {
			timeCriteria = new Criteria().andOperator(new Criteria("startTime").gte(new Date(timeTo)));
		}
		if(timeCriteria != null) {
			criteria = criteria.orOperator(
					new Criteria("startTime").exists(false), 
					new Criteria("startTime").is(null),
					timeCriteria
			);
		}  
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime", "creationDate"));
		query.limit(limit);
		query.skip((page - 1) * limit);
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
			criteria = criteria.andOperator(new Criteria("startTime").lte(new Date(timeFrom)));
		} else if(timeTo != null) {
			criteria = criteria.andOperator(new Criteria("startTime").gte(new Date(timeTo)));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "startTime"));
		query.limit(limit);
		query.skip((page - 1) * limit);
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
							notification.setType(Const.SERVICE_REQUEST_DELETED);
							notification.setServiceRequestId(result.getObjectId());
							addNotification(notification);
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
		query.limit(limit);
		query.skip((page - 1) * limit);
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
				notification.setType(Const.NEW_APPLICATION);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification);
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
				notification.setType(Const.APPLICATION_REJECTED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification);
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
				notification.setType(Const.APPLICATION_ACCEPTED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification);				
			}
		}
		return serviceRequest;
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
				notification.setType(Const.APPLICATION_DELETED);
				notification.setServiceRequestId(serviceRequest.getObjectId());
				addNotification(notification);				
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
			criteria = criteria.andOperator(new Criteria("timestamp").lte(new Date(timeFrom)));
		} else if(timeTo != null) {
			criteria = criteria.andOperator(new Criteria("timestamp").gte(new Date(timeTo)));
		}
		if(read != null) {
			criteria = criteria.andOperator(new Criteria("read").is(read));
		}
		if(Utils.isNotEmpty(type)) {
			criteria = criteria.andOperator(new Criteria("type").is(type));
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "timestamp"));
		query.limit(limit);
		query.skip((page - 1) * limit);
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
}
