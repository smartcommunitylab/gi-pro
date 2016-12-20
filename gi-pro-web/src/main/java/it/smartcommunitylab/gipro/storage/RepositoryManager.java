package it.smartcommunitylab.gipro.storage;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.util.StringUtils;

import it.smartcommunitylab.gipro.common.Const;
import it.smartcommunitylab.gipro.common.PasswordHash;
import it.smartcommunitylab.gipro.common.TranslationHelper;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.exception.AlreadyRegisteredException;
import it.smartcommunitylab.gipro.exception.EntityNotFoundException;
import it.smartcommunitylab.gipro.exception.InsufficientBalanceException;
import it.smartcommunitylab.gipro.exception.InvalidDataException;
import it.smartcommunitylab.gipro.exception.InvalidStateException;
import it.smartcommunitylab.gipro.exception.NotRegisteredException;
import it.smartcommunitylab.gipro.exception.NotVerifiedException;
import it.smartcommunitylab.gipro.exception.RegistrationException;
import it.smartcommunitylab.gipro.exception.UnauthorizedException;
import it.smartcommunitylab.gipro.model.Notification;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.model.Service;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.model.Service.ServiceSubtype;
import it.smartcommunitylab.gipro.push.NotificationManager;
import it.smartcommunitylab.gipro.security.DataSetInfo;
import it.smartcommunitylab.gipro.security.Token;

public class RepositoryManager {
	private static final transient Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
	
	@Autowired
	private NotificationManager notificationManager;
	
	@Autowired
	private TranslationHelper translationHelper;
	
	private MongoTemplate mongoTemplate;
	private String defaultLang;

	@Autowired
	private ServiceConfig serviceConfig;
	
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
		professional.setBalance(Const.INIT_BALANCE);
		professional.setNextBalanceUpdate(Const.nextBalanceUpdate(new Date()));
		mongoTemplate.save(professional);
		return professional;
	}
	
	public void saveProfessionalbyPEC(Professional professional) {
		Criteria criteria = new Criteria("applicationId").is(professional.getApplicationId())
				.and("pec").is(professional.getPec());
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
	
	public void updateProfessionalImageByPEC(String applicationId, String pec, String image) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec);
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
	
	private void updateProfessionalPasswordByPEC(String applicationId, String pec, String passwordHash) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec);
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
			case Const.NT_NEW_SERVICE_OFFER: {
				ServiceOffer offer = getServiceOfferById(applicationId, serviceOfferId);
				ServiceRequest request = getServiceRequestById(applicationId, serviceRequestId);
				Professional p = findProfessionalById(applicationId, offer.getProfessionalId());
				params = new String[]{ 
						p.getSurname(), 
						p.getName(), 
						offer.getAddress(),
						translationHelper.dateTime(request.getStartTime(), lang)
						};
				break;
			}
			case Const.NT_NEW_SERVICE_REQUEST: {
				ServiceOffer offer = getServiceOfferById(applicationId, serviceOfferId);
				ServiceRequest request = getServiceRequestById(applicationId, serviceRequestId);
				Professional p = findProfessionalById(applicationId, request.getRequesterId());
				params = new String[]{ 
						p.getSurname(), 
						p.getName(), 
						offer.getAddress(),
						translationHelper.dateTime(request.getStartTime(), lang)
						};
				break;
			}
			case Const.NT_REQUEST_ACCEPTED: 
			case Const.NT_REQUEST_DELETED: 
			case Const.NT_REQUEST_REJECTED: {
				ServiceOffer offer = getServiceOfferById(applicationId, serviceOfferId);
				ServiceRequest request = getServiceRequestById(applicationId, serviceRequestId);
				Professional p = findProfessionalById(applicationId, request.getProfessionalId());
				params = new String[]{ 
						p.getSurname(), 
						p.getName(), 
						offer.getAddress(),
						translationHelper.dateTime(request.getStartTime(), lang)
						};
				break;
			}
			// TODO
			case Const.NT_SERVICE_OFFER_DELETED:
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
	
	public List<Professional> findProfessional(String applicationId, String type, String area, String q, Integer page, Integer limit, String ... orderBy) {
		Criteria criteria = new Criteria("applicationId").is(applicationId);
		if (StringUtils.hasText(type)) {
			criteria.and("type").is(type);
		}
		if (StringUtils.hasText(area)) {
			criteria.and("area").is(area);
		}
		if (StringUtils.hasText(q)) {
			criteria.orOperator(
					new Criteria("surname").regex("/"+q.toLowerCase()+"/i"),
					new Criteria("customProperties.competences").regex("/"+q.toLowerCase()+"/i")
			);
		}
		Query query = new Query(criteria);
		if (orderBy != null && orderBy.length > 0 && orderBy[0] != null) {
			query.with(new Sort(Sort.Direction.ASC, orderBy));
		} else {
			query.with(new Sort(Sort.Direction.ASC, "surname", "name"));
		}
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

	public List<Professional> findProfessionalByIds(String applicationId, List<String> idList) {
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
	public Professional findAndUpdateBalanceProfessionalById(String applicationId, String professionalId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(professionalId);
		Query query = new Query(criteria);
		Professional result = mongoTemplate.findOne(query, Professional.class);
		if (result != null) {
			updateBalance(result, query);
		}
		result.setPasswordHash(null);
		return result;
	}

	private void updateBalance(Professional p, Query q) {
		Date now = new Date();
		if (p.getNextBalanceUpdate() == null || p.getNextBalanceUpdate().before(now)) {
			Date next = Const.nextBalanceUpdate(p.getNextBalanceUpdate());
			int nextBalance = Math.max(p.getBalance(), Const.INIT_BALANCE);

			while (next.before(now)) {
				next = Const.nextBalanceUpdate(next);
			}
			Update u = new Update();
			u.set("nextBalanceUpdate", next);
			u.set("balance", nextBalance);
			mongoTemplate.updateFirst(q,u, Professional.class);
			
			p.setNextBalanceUpdate(next);
			p.setBalance(nextBalance);
		}
	}

	public Professional findProfessionalByPEC(String applicationId, String pec) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec);
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
			String area, Long startTime, Integer page,	Integer limit, String ... orderBy) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
//				.and("poiId").is(poiId)
//				.and("serviceType").is(serviceType)
				.and("state").is(Const.STATE_OPEN)
				.and("professionalId").ne(professionalId);
		if (startTime != null) {
			Criteria timeCriteria = new Criteria().andOperator(
					Criteria.where("startTime").lte(new Date(startTime)),
					Criteria.where("endTime").gte(new Date(startTime)));
			criteria = criteria.orOperator(new Criteria("startTime").exists(false), new Criteria("startTime").is(null), timeCriteria);
		}
		if (StringUtils.hasText(serviceType)) {
			criteria.and("serviceType").is(serviceType);
		}
		if (StringUtils.hasText(area)) {
			criteria.and("area").is(area);
		}
		Query query = new Query(criteria);
		if (orderBy != null && orderBy.length > 0) {
			query.with(new Sort(Sort.Direction.ASC, orderBy));
		} else {
			query.with(new Sort(Sort.Direction.DESC, "creationDate"));
		}

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
		return serviceOffer;
	}

	public List<ServiceRequest> getOfferRequests(String applicationId, String offerId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("offerId").is(offerId)
				.and("state").in(Const.STATE_OPEN, Const.STATE_ACCEPTED)
				.and("startTime").gte(new Date());
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "creationDate"));
		List<ServiceRequest> result = mongoTemplate.find(query, ServiceRequest.class);
		return result;
	}

	public ServiceRequest saveServiceRequest(ServiceRequest serviceRequest) throws EntityNotFoundException, InsufficientBalanceException {
		// check balance
		Professional requester = findAndUpdateBalanceProfessionalById(serviceRequest.getApplicationId(), serviceRequest.getRequesterId());
		if (requester == null) throw new EntityNotFoundException("No requester found");
		
		ServiceOffer offer = getServiceOfferById(serviceRequest.getApplicationId(), serviceRequest.getOfferId());
		if (offer == null || !Const.STATE_OPEN.equals(offer.getState())) throw new EntityNotFoundException("Offer not found");
		serviceRequest.setProfessionalId(offer.getProfessionalId());
		
		Service service = serviceConfig.getService(serviceRequest.getServiceType());
		Integer cost = null;
		if (service != null) {
			ServiceSubtype sub = service.subtype(serviceRequest.getServiceSubtype());
			if (sub != null) cost = sub.getCost();
			else cost = service.getCost();
		}
		if (cost != null && requester.getBalance() < cost) {
			throw new InsufficientBalanceException("No balance for service");
		} 
		serviceRequest.setCost(cost);
		
		serviceRequest.setObjectId(Utils.getUUID());
		serviceRequest.setState(Const.STATE_OPEN);
		Date now = new Date();
		serviceRequest.setCreationDate(now);
		serviceRequest.setLastUpdate(now);
		serviceRequest.setAddress(offer.getAddress());
		serviceRequest.setArea(offer.getArea());
		serviceRequest.setPoiId(offer.getPoiId());
		
		mongoTemplate.save(serviceRequest);
		
		Criteria criteria = new Criteria("applicationId").is(requester.getApplicationId()).and("objectId").is(requester.getObjectId());
		mongoTemplate.updateFirst(Query.query(criteria), new Update().inc("balance", -cost), Professional.class);
		
		//search matching offers
		Date timestamp = new Date();
		ServiceOffer serviceOffer = getServiceOfferById(serviceRequest.getApplicationId(), serviceRequest.getOfferId());
		if (serviceOffer != null) {
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

//	private List<ServiceOffer> getMatchingOffers(ServiceRequest serviceRequest) {
//		Criteria criteria = new Criteria("applicationId").is(serviceRequest.getApplicationId())
//				.and("poiId").is(serviceRequest.getPoiId())
//				.and("serviceType").is(serviceRequest.getServiceType())
//				.and("state").is(Const.STATE_OPEN);
//		if(serviceRequest.isPrivateRequest()) {
//			criteria = criteria.andOperator(new Criteria("professionalId").in(serviceRequest.getRecipients()));
//		}
//		Criteria timeCriteria = new Criteria().andOperator(
//				Criteria.where("startTime").lte(serviceRequest.getStartTime()),
//				Criteria.where("endTime").gte(serviceRequest.getStartTime()));
//		criteria = criteria.orOperator(new Criteria("startTime").exists(false), new Criteria("startTime").is(null), timeCriteria);
//		Query query = new Query(criteria);
//		query.with(new Sort(Sort.Direction.DESC, "startTime", "creationDate"));
//		List<ServiceOffer> result = mongoTemplate.find(query, ServiceOffer.class);
//		return result;
//	}
	
	public List<ServiceOffer> getServiceOffers(String applicationId, String professionalId,
			String serviceType, Long timeFrom, Long timeTo, Boolean withTime, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("professionalId").is(professionalId)
				.and("state").ne(Const.STATE_DELETED);
		if (StringUtils.hasText(serviceType)) {
			criteria.and("serviceType").is(serviceType);
		}
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
				.and("requesterId").is(professionalId)
				.and("state").ne(Const.STATE_DELETED);
		if (StringUtils.hasText(serviceType)) {
			criteria.and("serviceType").is(serviceType);
		}
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
	public List<ServiceRequest> getServiceRequestsToMe(String applicationId, String professionalId,
			String serviceType, Long timeFrom, Long timeTo, Integer page, Integer limit) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("professionalId").is(professionalId)
				.and("state").ne(Const.STATE_DELETED);
		if (StringUtils.hasText(serviceType)) {
			criteria.and("serviceType").is(serviceType);
		}
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
		Update update = new Update().set("state", Const.STATE_DELETED);
		try {
			mongoTemplate.updateFirst(query, update, ServiceOffer.class);
		} catch (Exception e) {
			logger.warn("deleteServiceOffer:" + e.getMessage());
		} 
		List<ServiceRequest> requests = getOfferRequests(applicationId, objectId);
		if (requests != null)
			for (ServiceRequest req: requests) {
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(new Date());
				notification.setProfessionalId(req.getRequesterId());
				notification.setType(Const.NT_SERVICE_OFFER_DELETED);
				notification.setServiceOfferId(req.getOfferId());
				notification.setServiceRequestId(req.getObjectId());
				addNotification(notification, req.getRequesterId(), req.getServiceType());
			}
		return result;
	}

	public ServiceRequest acceptServiceRequest(String applicationId, String objectId) throws InvalidStateException {
		ServiceRequest req = getServiceRequestById(applicationId, objectId);
		if (!Const.STATE_OPEN.equals(req.getState())) throw new InvalidStateException("Request is not open");
		
		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
		Update update = new Update().set("state", Const.STATE_ACCEPTED);
		mongoTemplate.updateFirst(Query.query(criteria), update, ServiceRequest.class);
		
		req = getServiceRequestById(applicationId, objectId);
		Notification notification = new Notification();
		notification.setApplicationId(applicationId);
		notification.setTimestamp(new Date());
		notification.setProfessionalId(req.getRequesterId());
		notification.setType(Const.NT_REQUEST_ACCEPTED);
		notification.setServiceOfferId(req.getOfferId());
		notification.setServiceRequestId(req.getObjectId());
		addNotification(notification, req.getRequesterId(), req.getServiceType());
		return req;
	}
	public ServiceRequest rejectServiceRequest(String applicationId, String objectId) throws InvalidStateException {
		ServiceRequest req = getServiceRequestById(applicationId, objectId);
		if (!Const.STATE_OPEN.equals(req.getState())) throw new InvalidStateException("Request is not open");

		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
		Update update = new Update().set("state", Const.STATE_REJECTED);
		mongoTemplate.updateFirst(Query.query(criteria), update, ServiceRequest.class);

		criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(req.getRequesterId());
		mongoTemplate.updateFirst(Query.query(criteria), new Update().inc("balance", req.getCost()), Professional.class);

		
		req = getServiceRequestById(applicationId, objectId);
		Notification notification = new Notification();
		notification.setApplicationId(applicationId);
		notification.setTimestamp(new Date());
		notification.setProfessionalId(req.getRequesterId());
		notification.setType(Const.NT_REQUEST_REJECTED);
		notification.setServiceOfferId(req.getOfferId());
		notification.setServiceRequestId(req.getObjectId());
		addNotification(notification, req.getRequesterId(), req.getServiceType());
		return req;
	}
	
	
	public ServiceRequest deleteServiceRequest(String applicationId, String objectId, String professionalId) throws InvalidStateException {
		ServiceRequest result = null;
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId);
		Query query = new Query(criteria);
		result = mongoTemplate.findOne(query, ServiceRequest.class);
		if(result != null) {
			if (result.getRequesterId().equals(professionalId) && !Const.STATE_OPEN.equals(result.getState())) {
				throw new InvalidStateException("Already accepted/rejected");
			}
			if (result.getProfessionalId().equals(professionalId) && !Const.STATE_ACCEPTED.equals(result.getState())) {
				throw new InvalidStateException("Not yet accepted/rejected");
			}

			// notify requester when service provider cancels the request
			if (result.getProfessionalId().equals(professionalId)) {
				Notification notification = new Notification();
				notification.setApplicationId(applicationId);
				notification.setTimestamp(new Date());
				notification.setProfessionalId(result.getRequesterId());
				notification.setType(Const.NT_REQUEST_DELETED);
				notification.setServiceOfferId(result.getOfferId());
				notification.setServiceRequestId(result.getObjectId());
				addNotification(notification, result.getRequesterId(), result.getServiceType());
			// update balance
			} else {
				criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(result.getRequesterId());
				mongoTemplate.updateFirst(Query.query(criteria), new Update().inc("balance", result.getCost()), Professional.class);
			}

			Update update = new Update().set("state", Const.STATE_DELETED);
			mongoTemplate.updateFirst(query, update, ServiceRequest.class);
		}
		return result;
	}

//	public List<ServiceRequest> getServiceRequestApplications(String applicationId,
//			String professionalId, String serviceType, Long timestamp, Integer page, Integer limit) {
//		Criteria criteria = new Criteria("applicationId").is(applicationId)
//				.and("applicants." + professionalId).exists(true).and("serviceType").is(serviceType);
//		if(timestamp != null) {
//			criteria = criteria.andOperator(new Criteria("startTime").gte(new Date(timestamp)));
//		}
//		Query query = new Query(criteria);
//		query.with(new Sort(Sort.Direction.DESC, "startTime"));
//		if(limit != null) {
//			query.limit(limit);
//		}
//		if(page != null) {
//			query.skip((page - 1) * limit);
//		}
//		filterServiceRequestFields(professionalId, query);
//		List<ServiceRequest> result = mongoTemplate.find(query, ServiceRequest.class);
//		return result;
//	}
//
//	private void filterServiceRequestFields(String professionalId, Query query) {
//		query.fields().include("objectId");
//		query.fields().include("poiId");
//		query.fields().include("startTime");
//		query.fields().include("privateRequest");
//		query.fields().include("state");
//		query.fields().include("requesterId");
//		query.fields().include("applicants." + professionalId);
//		query.fields().include("customProperties");
//		query.fields().include("serviceType");
//	}
	
	private void filterProfessionalFields(Query query) {
		query.fields()
		.exclude("username")
		.exclude("passwordHash")
		.exclude("balance");
	}

//	public ServiceRequest applyToServiceRequest(String applicationId, String objectId,
//			String professionalId) {
//		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
//		Query query = new Query(criteria);
//		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
//		if(serviceRequest != null) {
//			Date timestamp = new Date();
//			//check if the professional hash already applyed
//			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
//			if(serviceApplication == null) {
//				//add application
//				serviceApplication = new ServiceApplication();
//				serviceApplication.setTimestamp(timestamp);
//				serviceApplication.setState(Const.SERVICE_APP_REQUESTED);
//				serviceApplication.setProfessionalId(professionalId);
//				serviceRequest.getApplicants().put(professionalId, serviceApplication);
//				updateServiceApplication(query, serviceRequest);
//				//add notification
//				Notification notification = new Notification();
//				notification.setApplicationId(applicationId);
//				notification.setTimestamp(timestamp);
//				notification.setProfessionalId(serviceRequest.getRequesterId());
//				notification.setType(Const.NT_NEW_APPLICATION);
//				notification.setServiceRequestId(serviceRequest.getObjectId());
//				addNotification(notification,serviceRequest.getRequesterId(), serviceRequest.getServiceType());
//			}
//			serviceRequest.getApplicants().clear();
//			serviceRequest.getApplicants().put(professionalId, serviceApplication);
//		}
//		return serviceRequest;
//	}
	
//	public ServiceRequest rejectServiceApplication(String applicationId, String objectId,
//			String professionalId) {
//		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
//		Query query = new Query(criteria);
//		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
//		if(serviceRequest != null) {
//			Date timestamp = new Date();
//			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
//			if(serviceApplication != null) {
//				serviceApplication.setState(Const.SERVICE_APP_REJECTED);
//				updateServiceApplication(query, serviceRequest);
//				//add notification
//				Notification notification = new Notification();
//				notification.setApplicationId(applicationId);
//				notification.setTimestamp(timestamp);
//				notification.setProfessionalId(serviceApplication.getProfessionalId());
//				notification.setType(Const.NT_APPLICATION_REJECTED);
//				notification.setServiceRequestId(serviceRequest.getObjectId());
//				addNotification(notification, serviceApplication.getProfessionalId(), serviceRequest.getServiceType());
//			}
//		}
//		return serviceRequest;
//	}
//
//	public ServiceRequest acceptServiceApplication(String applicationId, String objectId,
//			String professionalId) {
//		Criteria criteria = new Criteria("applicationId").is(applicationId).and("objectId").is(objectId);
//		Query query = new Query(criteria);
//		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
//		if(serviceRequest != null) {
//			Date timestamp = new Date();
//			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
//			if(serviceApplication != null) {
//				serviceApplication.setState(Const.SERVICE_APP_ACCEPTED);
//				updateServiceApplication(query, serviceRequest);
//				//add notification
//				Notification notification = new Notification();
//				notification.setApplicationId(applicationId);
//				notification.setTimestamp(timestamp);
//				notification.setProfessionalId(serviceApplication.getProfessionalId());
//				notification.setType(Const.NT_APPLICATION_ACCEPTED);
//				notification.setServiceRequestId(serviceRequest.getObjectId());
//				addNotification(notification, professionalId, serviceRequest.getServiceType());	
//			}
//		}
//		return serviceRequest;
//	}

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
	
//	public ServiceRequest deleteServiceApplication(String applicationId, String objectId,
//			String professionalId) {
//		Criteria criteria = new Criteria("applicationId").is(applicationId)
//				.and("objectId").is(objectId);
//		Query query = new Query(criteria);
//		ServiceRequest serviceRequest = mongoTemplate.findOne(query, ServiceRequest.class);
//		if(serviceRequest != null) {
//			Date timestamp = new Date();
//			ServiceApplication serviceApplication = serviceRequest.getApplicants().get(professionalId);
//			if(serviceApplication != null) {
//				serviceApplication.setState(Const.SERVICE_APP_DELETED);
//				updateServiceApplication(query, serviceRequest);
//				//add notification
//				Notification notification = new Notification();
//				notification.setApplicationId(applicationId);
//				notification.setTimestamp(timestamp);
//				notification.setProfessionalId(serviceRequest.getRequesterId());
//				notification.setType(Const.NT_APPLICATION_DELETED);
//				notification.setServiceRequestId(serviceRequest.getObjectId());
//				addNotification(notification, serviceRequest.getRequesterId(), serviceRequest.getServiceType());				
//			}
//		}
//		return serviceRequest;
//	}
	
//	private void updateServiceApplication(Query query, ServiceRequest serviceRequest) {
//		Date now = new Date();
//		Update update = new Update();
//		update.set("applicants", serviceRequest.getApplicants());
//		update.set("lastUpdate", now);
//		mongoTemplate.updateFirst(query, update, ServiceRequest.class);
//	}

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

	public ServiceOffer getServiceOfferById(String applicationId, String objectId) {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("objectId").is(objectId);
		Query query = new Query(criteria);
		ServiceOffer result = mongoTemplate.findOne(query, ServiceOffer.class);
		return result;
	}

	public ServiceRequest getServiceRequestById(String applicationId, String objectId) {
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

//	public Registration registerUser(String applicationId, String cf, String password, String name,
//			String surname, String mail) throws AlreadyRegisteredException, RegistrationException {
//		Registration registration = new Registration();
//		registration.setApplicationId(applicationId);
//		registration.setCf(cf);
//		registration.setPassword(password);
//		registration.setName(name);
//		registration.setSurname(surname);
//		registration.setMail(mail);
//		return registerUser(registration);
//	}
	
	public Registration registerUser(Registration registration) 
			throws AlreadyRegisteredException, RegistrationException {
		try {
			Criteria criteria = new Criteria("applicationId").is(registration.getApplicationId())
					.and("pec").is(registration.getPec());
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
		update.set("balance", Const.INIT_BALANCE);
		update.set("balanceNextUpdate", Const.nextBalanceUpdate(new Date()));
		update.set("lastUpdate", now);
		mongoTemplate.updateFirst(query, update, Registration.class);
		dbRegistration.setConfirmed(true);
		dbRegistration.setConfirmationKey(null);
		dbRegistration.setConfirmationDeadline(null);
		return dbRegistration;
	}

	public Registration resendConfirm(String pec) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("pec").is(pec).and("confirmed").is(Boolean.FALSE);
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

	public Registration resetPassword(String pec) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("pec").is(pec).and("confirmed").is(Boolean.TRUE);
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

	public void updatePassword(String pec, String password,
			String confirmationCode) throws Exception {
		Date now = new Date();
		Criteria criteria = new Criteria("pec").is(pec)
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
			updateProfessionalPasswordByPEC(dbRegistration.getApplicationId(), pec, newPassword);
		} catch (Exception e) {
			throw new RegistrationException(e.getMessage());
		}
	}

	public Professional loginByPEC(String applicationId, String pec, String password)
			throws Exception {
		Criteria criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec);
		Query query = new Query(criteria);
		Registration registration = mongoTemplate.findOne(query, Registration.class);
		if (registration == null) {
			throw new NotRegisteredException();
		}
		
		criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec)
				.and("confirmed").is(Boolean.TRUE);
		query = new Query(criteria);
		registration = mongoTemplate.findOne(query, Registration.class);
		if(registration == null) {
			throw new NotVerifiedException();
		}
		boolean matches = PasswordHash.validatePassword(password, registration.getPassword());
		if (!matches) {
			throw new UnauthorizedException("invalid password");
		}
		criteria = new Criteria("applicationId").is(applicationId)
				.and("pec").is(pec);
		query = new Query(criteria);
//		filterProfessionalFields(query);
		
		Professional professional = mongoTemplate.findOne(query, Professional.class);
		professional.setPasswordHash(null);
		return professional;
	}


}
