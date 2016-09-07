--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.2
-- Dumped by pg_dump version 9.5.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE d71kad5c6r40uv;
--
-- Name: daf; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE d71kad5c6r40uv WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'French_France.1252' LC_CTYPE = 'French_France.1252';


\connect d71kad5c6r40uv

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.modified = now();
    RETURN NEW;	
END;
$$;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: tbl_favourite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_favourite (
    id integer NOT NULL,
    id_recruiter integer NOT NULL,
    id_sequence integer NOT NULL,
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified time with time zone
);


--
-- Name: tbl_favourite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_favourite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_favourite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_favourite_id_seq OWNED BY tbl_favourite.id;


--
-- Name: tbl_interview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_interview (
    id integer NOT NULL,
    id_user integer,
    id_offer integer,
    date_time timestamp with time zone,
    type smallint NOT NULL,
    sector smallint NOT NULL,
    id_interviewer integer,
    appreciation smallint,
    status smallint NOT NULL,
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified time with time zone,
    id_video integer,
    "position" character varying(50),
    company character varying(50),
    summary text,
    job_type smallint DEFAULT 0,
    language character varying(5)
);


--
-- Name: COLUMN tbl_interview.id_offer; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_interview.id_offer IS 'If mock interview there is not offer associated';


--
-- Name: COLUMN tbl_interview.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_interview.type IS '1 = simulation
2 = offer';


--
-- Name: COLUMN tbl_interview.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_interview.status IS '1=proposed
2=defined';


--
-- Name: COLUMN tbl_interview.job_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_interview.job_type IS '1=penultimate(internhip), 2=last year (permanent position)';


--
-- Name: tbl_interview_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_interview_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_interview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_interview_id_seq OWNED BY tbl_interview.id;


--
-- Name: tbl_interviewer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_interviewer (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(80) NOT NULL,
    mobile_phone character varying(20) NOT NULL,
    password_hash character varying(255),
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified time with time zone
);


--
-- Name: tbl_interviewer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_interviewer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_interviewer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_interviewer_id_seq OWNED BY tbl_interviewer.id;


--
-- Name: tbl_offer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_offer (
    id integer NOT NULL,
    id_recruiter integer,
    sector smallint NOT NULL,
    offer_type smallint NOT NULL,
    company_type smallint NOT NULL,
    location character varying(50) NOT NULL,
    text text NOT NULL,
    created time with time zone DEFAULT clock_timestamp(),
    modified time with time zone,
    language character varying(5),
    company_name character varying(50),
    status smallint,
    "position" character varying(50),
    view_count smallint DEFAULT 0
);


--
-- Name: COLUMN tbl_offer.id_recruiter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_offer.id_recruiter IS 'A recruiter may have posted an offer or not';


--
-- Name: tbl_offer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_offer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_offer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_offer_id_seq OWNED BY tbl_offer.id;


--
-- Name: tbl_recruiter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_recruiter (
    id integer NOT NULL,
    email character varying(80) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    company character varying(50) NOT NULL,
    mobile_phone character varying(20) NOT NULL,
    password_hash character varying(255) NOT NULL,
    language character varying(5),
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified timestamp with time zone,
    active boolean DEFAULT false
);


--
-- Name: tbl_recruiter_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_recruiter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_recruiter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_recruiter_id_seq OWNED BY tbl_recruiter.id;


--
-- Name: tbl_sequence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_sequence (
    id integer NOT NULL,
    id_interview integer NOT NULL,
    tag character varying(30) NOT NULL,
    summary text NOT NULL,
    appreciation smallint NOT NULL,
    id_video integer,
    visible boolean DEFAULT true NOT NULL,
    created time with time zone DEFAULT clock_timestamp(),
    modified time with time zone
);


--
-- Name: tbl_sequence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_sequence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_sequence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_sequence_id_seq OWNED BY tbl_sequence.id;


--
-- Name: tbl_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_user (
    id integer NOT NULL,
    email character varying(80) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    sector smallint NOT NULL,
    availability character varying(255) NOT NULL,
    mobile_phone character varying(20),
    skype_id character varying(50),
    language character varying(5) DEFAULT 'fr'::bpchar,
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified timestamp with time zone,
    cv character varying(50),
    job_type smallint DEFAULT 0
);


--
-- Name: COLUMN tbl_user.sector; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_user.sector IS 'Used to store last choicie when user books another interview';


--
-- Name: COLUMN tbl_user.availability; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_user.availability IS 'Used to store last choicie when user books another interview';


--
-- Name: COLUMN tbl_user.job_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tbl_user.job_type IS '1=penultimate(internhip), 2=last year (permanent position)
Used to store last choicie when user books another mock interview';


--
-- Name: tbl_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_user_id_seq OWNED BY tbl_user.id;


--
-- Name: tbl_video; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tbl_video (
    id integer NOT NULL,
    url character varying(200),
    provider character varying(50),
    provider_unique_id character varying(50),
    provider_cloud_name character varying(50),
    created timestamp with time zone DEFAULT clock_timestamp(),
    modified time with time zone
);


--
-- Name: tbl_video_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tbl_video_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tbl_video_id_seq OWNED BY tbl_video.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_favourite ALTER COLUMN id SET DEFAULT nextval('tbl_favourite_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interview ALTER COLUMN id SET DEFAULT nextval('tbl_interview_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interviewer ALTER COLUMN id SET DEFAULT nextval('tbl_interviewer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_offer ALTER COLUMN id SET DEFAULT nextval('tbl_offer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_recruiter ALTER COLUMN id SET DEFAULT nextval('tbl_recruiter_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_sequence ALTER COLUMN id SET DEFAULT nextval('tbl_sequence_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_user ALTER COLUMN id SET DEFAULT nextval('tbl_user_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_video ALTER COLUMN id SET DEFAULT nextval('tbl_video_id_seq'::regclass);


--
-- Name: session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: tbl_favourite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_favourite
    ADD CONSTRAINT tbl_favourite_pkey PRIMARY KEY (id);


--
-- Name: tbl_interview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interview
    ADD CONSTRAINT tbl_interview_pkey PRIMARY KEY (id);


--
-- Name: tbl_interviewer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interviewer
    ADD CONSTRAINT tbl_interviewer_pkey PRIMARY KEY (id);


--
-- Name: tbl_offer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_offer
    ADD CONSTRAINT tbl_offer_pkey PRIMARY KEY (id);


--
-- Name: tbl_recruiter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_recruiter
    ADD CONSTRAINT tbl_recruiter_pkey PRIMARY KEY (id);


--
-- Name: tbl_sequence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_sequence
    ADD CONSTRAINT tbl_sequence_pkey PRIMARY KEY (id);


--
-- Name: tbl_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_user
    ADD CONSTRAINT tbl_user_pkey PRIMARY KEY (id);


--
-- Name: tbl_video_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_video
    ADD CONSTRAINT tbl_video_pkey PRIMARY KEY (id);


--
-- Name: unique_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_user
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: unique_email_interviewer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interviewer
    ADD CONSTRAINT unique_email_interviewer UNIQUE (email);


--
-- Name: unique_recruiter_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_recruiter
    ADD CONSTRAINT unique_recruiter_email UNIQUE (email);


--
-- Name: fki_tbl_sequence_id_video_fkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_tbl_sequence_id_video_fkey ON tbl_sequence USING btree (id_video);


--
-- Name: public_tbl_favourite_id_recruiter0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_favourite_id_recruiter0_idx ON tbl_favourite USING btree (id_recruiter);


--
-- Name: public_tbl_favourite_id_sequence1_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_favourite_id_sequence1_idx ON tbl_favourite USING btree (id_sequence);


--
-- Name: public_tbl_interview_id_interviewer2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_interview_id_interviewer2_idx ON tbl_interview USING btree (id_interviewer);


--
-- Name: public_tbl_interview_id_offer1_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_interview_id_offer1_idx ON tbl_interview USING btree (id_offer);


--
-- Name: public_tbl_interview_id_user0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_interview_id_user0_idx ON tbl_interview USING btree (id_user);


--
-- Name: public_tbl_offer_id_recruiter0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_offer_id_recruiter0_idx ON tbl_offer USING btree (id_recruiter);


--
-- Name: public_tbl_sequence_id_interview0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_tbl_sequence_id_interview0_idx ON tbl_sequence USING btree (id_interview);


--
-- Name: tbl_video_id_uindex; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tbl_video_id_uindex ON tbl_video USING btree (id);


--
-- Name: update_favourite_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_favourite_modtime BEFORE UPDATE ON tbl_favourite FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_interview_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_interview_modtime BEFORE UPDATE ON tbl_interview FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_offer_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_offer_modtime BEFORE UPDATE ON tbl_offer FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_recruiter_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recruiter_modtime BEFORE UPDATE ON tbl_recruiter FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_sequence_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sequence_modtime BEFORE UPDATE ON tbl_sequence FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_user_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_modtime BEFORE UPDATE ON tbl_user FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: update_video_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_video_modtime BEFORE UPDATE ON tbl_video FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: tbl_favourite_id_recruiter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_favourite
    ADD CONSTRAINT tbl_favourite_id_recruiter_fkey FOREIGN KEY (id_recruiter) REFERENCES tbl_recruiter(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_favourite_id_sequence_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_favourite
    ADD CONSTRAINT tbl_favourite_id_sequence_fkey FOREIGN KEY (id_sequence) REFERENCES tbl_sequence(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_interview_id_interviewer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interview
    ADD CONSTRAINT tbl_interview_id_interviewer_fkey FOREIGN KEY (id_interviewer) REFERENCES tbl_interviewer(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_interview_id_offer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interview
    ADD CONSTRAINT tbl_interview_id_offer_fkey FOREIGN KEY (id_offer) REFERENCES tbl_offer(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_interview_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_interview
    ADD CONSTRAINT tbl_interview_id_user_fkey FOREIGN KEY (id_user) REFERENCES tbl_user(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_offer_id_recruiter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_offer
    ADD CONSTRAINT tbl_offer_id_recruiter_fkey FOREIGN KEY (id_recruiter) REFERENCES tbl_recruiter(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_sequence_id_interview_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_sequence
    ADD CONSTRAINT tbl_sequence_id_interview_fkey FOREIGN KEY (id_interview) REFERENCES tbl_interview(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tbl_sequence_id_video_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tbl_sequence
    ADD CONSTRAINT tbl_sequence_id_video_fkey FOREIGN KEY (id_video) REFERENCES tbl_video(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

