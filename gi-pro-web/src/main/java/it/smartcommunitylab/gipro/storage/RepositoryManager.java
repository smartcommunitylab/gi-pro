package it.smartcommunitylab.gipro.storage;

import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.security.DataSetInfo;
import it.smartcommunitylab.gipro.security.Token;

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
	
	public List<?> findData(Class<?> entityClass, Criteria criteria, Sort sort, String ownerId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("applicationId").is(ownerId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("applicationId").is(ownerId));
		}
		if (sort != null) {
			query.with(sort);
		}
		query.limit(5000);
		List<?> result = mongoTemplate.find(query, entityClass);
		return result;
	}

	public <T> T findOneData(Class<T> entityClass, Criteria criteria, String ownerId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("applicationId").is(ownerId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("applicationId").is(ownerId));
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
	
	public void cleanPoi(String ownerId) {
		Query query = new Query(new Criteria("applicationId").is(ownerId));
		mongoTemplate.remove(query, Poi.class);
	}

	public List<Professional> findProfessional(String applicationId, Integer page, Integer limit) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Professional> findProfessionalByIds(String applicationId, String[] idArray) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Poi> findPoi(String applicationId, Integer page, Integer limit) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Poi> findPoiByIds(String applicationId, String[] idArray) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<ServiceOffer> searchServiceOffer(String applicationId, Long startTime, Integer page,
			Integer limit) {
		// TODO Auto-generated method stub
		return null;
	}

	public ServiceOffer saveServiceOffer(ServiceOffer serviceOffer) {
		// TODO Auto-generated method stub
		return null;
	}

	public ServiceRequest savePublicServiceRequest(ServiceRequest serviceRequest) {
		// TODO Auto-generated method stub
		return null;
	}

	public ServiceRequest savePrivateServiceRequest(ServiceRequest serviceRequest) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<ServiceOffer> getServiceOffers(String applicationId, String professionalId,
			Integer page, Integer limit) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<ServiceRequest> getServiceRequests(String applicationId, String professionalId,
			Integer page, Integer limit) {
		// TODO Auto-generated method stub
		return null;
	}

	public ServiceOffer deleteServiceOffer(String applicationId, String objectId) {
		// TODO Auto-generated method stub
		return null;
	}

	public ServiceRequest deleteServiceRequest(String applicationId, String objectId) {
		// TODO Auto-generated method stub
		return null;
	}
	
}
